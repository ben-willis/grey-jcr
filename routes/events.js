var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');

var BookingManager = require('../helpers/bookings');

var Event = require('../models/event');
var Ticket = require('../models/ticket');
var Booking = require('../models/booking');
var User = require('../models/user');

/* GET home page. */
router.get('/', function (req, res, next) {
	Event.getFutureEvents()
		.then(function (events) {
			res.render('events/index', {events: events.splice(0,4)});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET calendar page. */
router.get('/calendar/:year?/:month?', function (req, res, next) {
	res.render('events/calendar');
});

/* GET the bookings page */
router.get('/:event_id/:ticket_id/book', function (req, res, next) {
	Ticket.findById(parseInt(req.params.ticket_id))
		.then(function (ticket) {
			if (ticket.open_booking > (new Date()) || ticket.close_booking < (new Date())) {
				throw httpError(400, "Booking is not open at this time");
			}
			res.render('events/event_book', {event_id: req.params.event_id, ticket: ticket});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a booking */
router.post('/:event_id/:ticket_id/book', function (req, res, next) {
	var booking_names = req.body.bookings.filter(function(name) {
		return (name != "");
	});

	var bookings = null;

	BookingManager.createBooking(parseInt(req.params.ticket_id), parseInt(req.params.event_id), req.user.username, booking_names)
		.then(function(data) {
			bookings = data;
			return Ticket.findById(parseInt(req.params.ticket_id));
		})
		.then(function(ticket) {
			return Promise.all(
				bookings.map(function(booking) {
					username = (booking.username != null) ? booking.username : booking.booked_by;
					return User.findByUsername(username).then(function(user){
						amount = (booking.username != null) ? ticket.price : (ticket.price + ticket.guest_surcharge);
						name = (booking.username != null) ? booking.username : booking.guestname;
						return user.setDebtForBooking(ticket.name, "Ticket for "+name, amount, booking.id);
					});
				})
			)
		})
		.then(function(){
			return Event.findById(parseInt(req.params.event_id))
		})
		.then(function(event) {
			res.redirect(303, "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+req.params.ticket_id+"/booking?success")
		})
		.catch(function(err) {
			next(err);
		});
});


/* GET your booking */
router.get('/:year/:month/:day/:slug/:ticket_id/booking', function (req, res, next) {
	var ticket;
	var event;
	Event.findBySlugAndDate(req.params.slug, new Date(req.params.year, parseInt(req.params.month)-1, req.params.day))
		.then(function(data) {
			event = data;
			return Ticket.findById(parseInt(req.params.ticket_id))
		})
		.then(function(data) {
			ticket = data;
			return Booking.getByTicketIdAndUsername(parseInt(req.params.ticket_id), req.user.username);
		})
		.then(function(bookings){
			return Promise.all(
				bookings.map(function(booking) {
					return booking.getChoices().then(function(choices) {
						return booking;
					})
				})
			)
		})
		.then(function(bookings) {
			res.render('events/event_booking', {event: event, ticket: ticket, bookings: bookings});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a booking update */
router.post('/:booking_id', function (req, res, next) {
	var booking = null;
	var ticket = null;
	var amount = 0;
	booking_choices = (req.body.choices == undefined) ? [] : req.body.choices.filter(function(choice) {return (choice != "")})
	Booking.findById(parseInt(req.params.booking_id))
		.then(function(data) {
			booking = data;
			return Promise.all([
				booking.setChoices(booking_choices),
				booking.updateNotes(req.body.notes)
			])
		})
		.then(function(){
			return Ticket.findById(booking.ticket_id);
		})
		.then(function(data){
			ticket = data;
			ticket_price = (booking.username != null) ? ticket.price : ticket.price + ticket.guest_surcharge;
			amount += ticket_price;
			return Promise.all(
				booking_choices.map(function(choice_id) {
					return booking.getChoiceDetailsById(choice_id).then(function(choice) {
						return choice.price;
					})
				})
			)
		})
		.then(function(choice_prices) {
			amount += choice_prices.reduce((a,b) => a+b, 0);
			username = (booking.username != null) ? booking.username : booking.booked_by;
			return User.findByUsername(username);
		})
		.then(function(user) {
			name = (booking.username != null) ? booking.username : booking.guestname;
			return user.setDebtForBooking(ticket.name, "Ticket for "+name, amount, booking.id)
		})
		.then(function() {
			return Event.findById(parseInt(req.body.event_id));
		})
		.then(function(event){
			res.redirect(303, "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+booking.ticket_id+"/booking?success");
		}).catch(function(err) {
			next(err);
		});
});

/* GET an event */
router.get('/:year/:month/:day/:slug', function (req, res, next) {
	var event = null;
	var tickets = [];
	Event.findBySlugAndDate(req.params.slug, new Date(req.params.year, req.params.month-1, req.params.day)).then(function (data) {
			event = data;
			if (!req.user) return [];
			return event.getTickets();
		})
		.then(function(ticket_ids) {
			return Promise.all(
				ticket_ids.map(function(ticket_id) {
					return Promise.all([
						Ticket.findById(ticket_id),
						Booking.getByTicketIdAndUsername(ticket_id, req.user.username),
						Booking.countByTicketId(ticket_id)
					]).then(function(data) {
						ticket = data[0];
						ticket.bookings = data[1];
						ticket.sold = data[2];
						return ticket;
					});
				})
			)
		})
		.then(function(tickets) {
			res.render('events/event', {event: event, tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
