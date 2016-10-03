var express = require('express');
var router = express.Router();
var validator = require('validator');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var csv = require('csv');
var treeize   = require('treeize');
var slug = require('slug');

var Event = require('../../models/event');
var Ticket = require('../../models/ticket');

/* GET events page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Event.getFutureEvents(),
		Event.getPastEvents()
	]).then(function (data) {
		res.render('admin/events', {future_events: data[0], past_events: data[1]});
	}).catch(function (err) {
		next(err);
	});
});

/* POST a new events */
router.post('/new', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var time = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	Event.create(req.body.name, req.body.description, time, null).then(function (event){
		res.redirect('/admin/events/'+event.id+'/edit')
	}).catch(function (err) {
		next(err);
	});
});

/* GET edit events page. */
router.get('/:event_id/edit', function (req, res, next) {
	var event;
	Event.findById(parseInt(req.params.event_id)).then(function (data) {
		event = data;
		return Promise.all([
			event.getTickets(),
			Ticket.getAll()
		])
	}).then(function (data) {
		event.tickets = data[0]
		res.render('admin/events_edit', {event: event, tickets: data[1]});
	}).catch(function (err) {
		next(err);
	});
});

/* POST an update to an event */
router.post('/:event_id/edit', upload.single('image'), function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var timestamp = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	Event.findById(parseInt(req.params.event_id)).then(function(event) {
		return Promise.all([
			event,
			event.setTickets([].concat(req.body.tickets))
		])
	}).then(function(data) {
		event = data[0]
		if (req.file) {
			var image_name = makeid(5)+'.'+mime.extension(req.file.mimetype);
			mv(req.file.path, __dirname+'/../../public/images/events/'+image_name, function (err) {
				if (err) throw err;
				return event.update(req.body.name, req.body.description, timestamp, image_name);
			});
		} else {
			return event.update(req.body.name, req.body.description, timestamp, null);
		}
	}).then(function () {
		res.redirect('/admin/events/'+req.params.event_id+'/edit?success')
	}).catch(function (err) {
		return next(err);
	});
});

/* GET a delete events event */
router.get('/:event_id/delete', function (req, res, next) {
	Event.findById(req.params.event_id).then(function (event) {
		return event.delete();
	}).then(function(){
		res.redirect('/admin/events');
	}).catch(function (err) {
		next(err);
	})
});

/* GET an events bookings */
router.get('/:event_id/bookings.csv', function (req, res, next){
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

function makeid(n)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = router;
