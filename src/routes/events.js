var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');

var BookingManager = require('../helpers/bookings');
var Mail = require('../helpers/mail');

var Event = require('../models/event');
var Ticket = require('../models/ticket');
var Booking = require('../models/booking');
var User = require('../models/user');

var valentines = require('./valentines');

/* GET home page. */
router.get('/', function (req, res, next) {
	Event.getFutureEvents()
		.then(function (events) {
			res.render('events/index', {events: events.splice(0,6)});
		})
		.catch(function (err) {
			next(err);
		});
});

router.use('/valentines', valentines);

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
		return (name !== "");
	});

	var bookings = null;
	var ticket = null;
	var event = null;

	BookingManager.createBooking(parseInt(req.params.ticket_id), parseInt(req.params.event_id), req.user.username, booking_names)
		.then(function(data) {
			bookings = data;
			return Promise.all([
				Ticket.findById(parseInt(req.params.ticket_id)),
				Event.findById(parseInt(req.params.event_id))
			]);
		})
		.then(function(data) {
			ticket = data[0];
			event = data[1];
			return Promise.all(
				bookings.map(function(booking) {
					var username = (booking.username !== null) ? booking.username : booking.booked_by;
					return User.findByUsername(username).then(function(user){
						var amount = (booking.username !== null) ? ticket.price : (ticket.price + ticket.guest_surcharge);
						var name = (booking.username !== null) ? user.name : booking.guestname;

						// Send Email
						var email_text = "Dear "+user.name+"," +
										 "\n\n" +
										 "Thank you for booking on to "+event.name+"!" +
										 "\n\n" +
										 "Name: "+name+"\nTicket: "+ticket.name+"\nBase Price: £"+(amount/100).toFixed(2) +
										 "\n\n" +
										 "Please make sure you fill out drink options and any dietary requirements at www.greyjcr.com/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+ticket.id+"/booking if you are required to." +
										 "\n\n" +
										 "A debt of £"+(amount/100).toFixed(2)+" has been added to your account, please pay this debt off promptly. You can pay your debt off at: www.greyjcr.com/services/debt. If you have any queries regarding your debt email grey.treasurer@durham.ac.uk."+
										 "\n\n" + 
										 "Hope you have a Greyt time!";
						Mail.send(user.email, event.name+" Booking Confirmation", email_text);

						// Set Debt
						return user.setDebtForBooking(ticket.name, "Ticket for "+name, amount, booking.id);
					});
				})
			);
		})
		.then(function() {
			res.redirect(303, "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+req.params.ticket_id+"/booking?success");
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
			return Ticket.findById(parseInt(req.params.ticket_id));
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
					});
				})
			);
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
	var ticketName = null;
	var amount = 0;
	var booking_choices = (req.body.choices === undefined) ? [] : req.body.choices.filter((choice) => (choice !== ""));
	Booking.findById(parseInt(req.params.booking_id))
		.then(function(data) {
			booking = data;
			return Promise.all([
				booking.setChoices(booking_choices),
				booking.updateNotes(req.body.notes)
			]);
		})
		.then(function(){
			return Ticket.findById(booking.ticket_id);
		})
		.then(function(ticket){
			ticketName = ticket.name;
			var ticket_price = (booking.username !== null) ? ticket.price : ticket.price + ticket.guest_surcharge;
			amount += ticket_price;
			return Promise.all(
				booking_choices.map(function(choice_id) {
					return booking.getChoiceDetailsById(choice_id).then(function(choice) {
						return choice.price;
					});
				})
			);
		})
		.then(function(choice_prices) {
			amount += choice_prices.reduce((a,b) => a+b, 0);
			var username = (booking.username !== null) ? booking.username : booking.booked_by;
			return User.findByUsername(username);
		})
		.then(function(user) {
			var name = (booking.username !== null) ? booking.username : booking.guestname;
			return user.setDebtForBooking(ticketName, "Ticket for "+name, amount, booking.id);
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
						var ticket = data[0];
						ticket.bookings = data[1];
						ticket.sold = data[2];
						return ticket;
					});
				})
			);
		})
		.then(function(tickets) {
			res.render('events/event', {event: event, tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
