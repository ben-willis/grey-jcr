var express = require('express');
var router = express.Router();
var validator = require('validator');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var csv = require('csv');
var treeize   = require('treeize');

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
	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var timestamp = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	var values = [req.params.eventid];
	var query = "DELETE FROM events_tickets WHERE eventid=$1; "
	if (req.body.tickets) {
		req.body.tickets = [].concat(req.body.tickets);
		// Build tickets query
		query += "INSERT INTO events_tickets (eventid, ticketid) VALUES ";
		for (var i = 0; i < req.body.tickets.length; i++) {
			if (i != 0) {
				query += ", "
			}
			query += "($1, $"+(i+2)+")";
			values.push(req.body.tickets[i]);
		};
	}
	req.db.none(query, values)
		.then( function (){
			if (req.file) {
				var image_name = makeid(5)+'.'+mime.extension(req.file.mimetype);
				mv(req.file.path, __dirname+'/../../public/images/events/'+image_name, function (err) {
					if (err) throw err;
					return req.db.none('UPDATE events SET name=$1, slug=$2, description=$3, timestamp=$4, image=$5 WHERE id=$6', [req.body.name, slugify(req.body.name), req.body.description, timestamp.toLocaleString(), image_name, req.params.eventid]);
				});
			} else {
				return req.db.none('UPDATE events SET name=$1, slug=$2, description=$3, timestamp=$4 WHERE id=$5', [req.body.name, slugify(req.body.name), req.body.description, timestamp.toLocaleString(), req.params.eventid]);
			}
		})
		.then(function () {
			res.redirect('/admin/events/'+req.params.eventid+'/edit?success')
		})
		.catch(function (err) {
			return next(err);
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
	var bookings;
	req.db.many('SELECT tickets.id AS "ticket_id", tickets.name AS ticket_name, bookings.booked_by, users.name, users.email, bookings.notes, bookings.id AS "id*", bookings.guest_name, ticket_option_choices.name AS "choices:name", ticket_option_choices.id AS "choices:id" FROM bookings LEFT JOIN tickets ON tickets.id=bookings.ticketid LEFT JOIN users ON bookings.username=users.username LEFT JOIN booking_choices ON bookings.id=booking_choices.bookingid LEFT JOIN ticket_option_choices ON ticket_option_choices.id=booking_choices.choiceid WHERE bookings.eventid=$1;', [req.params.eventid])
		.then(function (data){
			var tree = new treeize;
			tree.grow(data);
			bookings = tree.getData();
			return req.db.manyOrNone('SELECT tickets.id, tickets.name, ticket_options.name AS "options:name", ticket_options.id AS "options:id", ticket_option_choices.id AS "options:choices:id" FROM tickets LEFT JOIN ticket_options ON ticket_options.ticketid=tickets.id LEFT JOIN ticket_option_choices ON ticket_option_choices.optionid=ticket_options.id LEFT JOIN events_tickets ON events_tickets.ticketid=tickets.id WHERE events_tickets.eventid=$1', [req.params.eventid])
		})
		.then(function(data) {
			var tree = new treeize;
			tree.grow(data);
			tickets = tree.getData();

			// Build the Columns
			var columns = {
				ticket_name: 'Ticket',
				booked_by: 'Booked By',
				name: 'Name',
				guest: 'Guest',
				email: 'Email',
				notes: 'Notes',
			}
			recorded = [];
			options = [];
			for (var i = 0; i < tickets.length; i++) {
				if (!tickets[i].options) {
					tickets[i].options = [];
				}
				for (var j = 0; j < tickets[i].options.length; j++) {
					if (recorded.indexOf(tickets[i].options[j].id) == -1) {
						recorded.push(tickets[i].options[j].id);
						options.push(tickets[i].options[j]);
						columns["option"+tickets[i].options[j].id] = tickets[i].options[j].name
					}
				};
			};
			// For each booking
			for (var i = 0; i < bookings.length; i++) {
				// Make sure we have the name
				bookings[i].guest = (!bookings[i].name);
				if (bookings[i].guest) {
					bookings[i].name = bookings[i].guest_name;
				}
				delete bookings[i].guest_name;
				// For each option
				for (var j = 0; j < options.length; j++) {
					// For each possible choice
					choices:
					for (var k = 0; k < options[j].choices.length; k++) {
						//Compare with all our choices
						// First check we have choices
						if (bookings[i].choices) {
							// Then for each of our choices
							for (var l = bookings[i].choices.length - 1; l >= 0; l--) {
								// We compare out choice with the possible choice
								if (bookings[i].choices[l].id == options[j].choices[k].id) {
									// If the match we add it and delete the choice
									bookings[i]["option"+(options[j].id)] = bookings[i].choices[l].name;
									bookings[i].choices.splice(l, 1);
									break choices;
								}
							};
						}
					};
				};
				delete bookings[i].choices;
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
