var express = require('express');
var router = express.Router();
var validator = require('validator');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var csv = require('csv');

/* GET events page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT events.id, events.name, events.description, events.timestamp FROM events ORDER BY timestamp ASC')
		.then(function (events) {
			res.render('admin/events', {events: events});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new events */
router.post('/new', function (req, res, next) {
	console.log(req.body);
	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var timestamp = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	req.db.one('INSERT INTO events(name, description, timestamp, slug) VALUES ($1, $2, $3, $4) RETURNING id',[req.body.name, req.body.description, timestamp.toLocaleString(), slugify(req.body.name)])
		.then(function (event){
			res.redirect('/admin/events/'+event.id+'/edit')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET edit events page. */
router.get('/:eventid/edit', function (req, res, next) {
	var tickets;
	req.db.manyOrNone('SELECT id, name, (SELECT COUNT(*)>0 FROM events_tickets WHERE ticketid=tickets.id AND eventid=$1) AS selected FROM tickets ORDER BY name DESC', [req.params.eventid])
		.then(function (data) {
			tickets = data;
			return req.db.one('SELECT events.id, events.name, events.timestamp, events.description FROM events WHERE events.id=$1', req.params.eventid)
		})
		.then(function (event) {
			res.render('admin/events_edit', {event: event, tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST and update to a events */
router.post('/:eventid/edit', upload.single('image'), function (req, res, next) {
	console.log(req.body);

	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var timestamp = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	if (req.body.tickets) {
		// Build tickets query
		var query = "DELETE FROM events_tickets WHERE eventid=$1; INSERT INTO events_tickets (eventid, ticketid) VALUES ";
		var values = [req.params.eventid];
		for (var i = 0; i < req.body.tickets.length; i++) {
			if (i != 0) {
				query += ", "
			}
			query+= "($1, $"+(i+2)+")"
			values.push(req.body.tickets[i]);
		};
	} else {
		query = 'DELETE FROM events_tickets WHERE eventid=$1';
		values = [req.params.eventid];
	}
	req.db.none(query, values)
		.then( function (){
			if (req.file) {
				var image_name = makeid(5);
				mv(req.file.path, __dirname+'/../../public/images/events/'+image_name+'.png', function (err) {
					if (err) return next(err);
					return req.db.none('UPDATE events SET name=$1, slug=$2, description=$3, timestamp=$4, image=$5 WHERE id=$6', [req.body.name, slugify(req.body.name), req.body.description, timestamp.toLocaleString(), image_name+'.png', req.params.eventid]);
				});
			} else {
				return req.db.none('UPDATE events SET name=$1, slug=$2, description=$3, timestamp=$4 WHERE id=$5', [req.body.name, slugify(req.body.name), req.body.description, timestamp.toLocaleString(), req.params.eventid]);
			}
		})
		.then(function () {
			res.redirect('/admin/events/'+req.params.eventid+'/edit?success')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET a delete events event */
router.get('/:eventid/delete', function (req, res, next) {
	req.db.none("DELETE FROM events WHERE id=$1", req.params.eventid)
		.then(function () {
			res.redirect('/admin/events');
		})
		.catch(function (err) {
			next(err);
		})
});

/* GET an events bookings */
router.get('/:eventid/bookings.csv', function (req, res, next){
	req.db.many('SELECT tickets.name AS ticket_name, users.name, users.email, bookings.guest_name FROM bookings LEFT JOIN tickets ON tickets.id=bookings.ticketid LEFT JOIN users ON bookings.username=users.username WHERE bookings.eventid=$1', [req.params.eventid])
		.then(function (bookings){
			var columns = {
				ticket_name: 'Ticket',
				name: 'Name',
				email: 'Email'
			}
			for (var i = 0; i < bookings.length; i++) {
				if (!bookings[i].name) {
					bookings[i].name = bookings[i].guest_name;
				}
				delete bookings[i].guest_name;
			};
			csv.stringify(bookings, {header: true, columns: columns}, function (err, output) {
				if (err) throw err;
				res.set('Content-Type', 'text/csv');
				res.status(200).send(output);
			})
		})
		.catch(function (err){
			next(err);
		});
});

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function makeid(n)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = router;
