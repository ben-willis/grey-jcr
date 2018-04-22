var express = require('express');
var router = express.Router();
var httpError = require('http-errors');

var BookingManager = require('../helpers/bookings');
var Mail = require('../helpers/mail');

const Op = require("sequelize").Op;

var models = require("../models");

/* GET home page. */
router.get('/', function (req, res, next) {
	models.event.findAll({
		where: {time: {[Op.gte]: new Date()}},
		order: [["time", "ASC"]],
		limit: 6
	}).then(function (events) {
		res.render('events/index', {events: events.splice(0,6)});
	}).catch(next);
});

router.use('/valentines', valentines);

/* GET calendar page. */
router.get('/calendar/:year?/:month?', function (req, res, next) {
	res.render('events/calendar');
});

/* GET the bookings page */
router.get('/:event_id/:ticket_id/book', function (req, res, next) {
	models.ticket.findById(req.params.ticket_id).then(function (ticket) {
		if (ticket.open_booking > (new Date()) || ticket.close_booking < (new Date())) {
			throw httpError(400, "Booking is not open at this time");
		}
		res.render('events/event_book', {event_id: req.params.event_id, ticket: ticket});
	}).catch(next);
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
				models.ticket.findById(req.params.ticket_id),
				models.event.findById(req.params.event_id)
			]);
		})
		.then(function(data) {
			ticket = data[0];
			event = data[1];
			return Promise.all(
				bookings.map(function(booking) {
					var username = (booking.username !== null) ? booking.username : booking.booked_by;
					return models.user.findById(username).then(function(user) {
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
						return models.debt.create({
							name: ticket.name,
							message: "Ticket for"+name,
							amount: amount,
							username: user.username,
							booking_id: booking.id
						});
					});
				})
			);
		}).then(function() {
			res.redirect(303, "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+req.params.ticket_id+"/booking?success");
		}).catch(next);
});


/* GET your booking */
router.get('/:year/:month/:day/:slug/:ticket_id/booking', function (req, res, next) {
	var eventPromise = models.event.findOne({
		where: {
			slug: req.params.slug,
			time: {
				[Op.between]: [
					new Date(req.params.year, req.params.month - 1, req.params.day),
					new Date(req.params.year, req.params.month - 1, req.params.day+1)
				]
			}
		}
	});
	var ticketPromise = models.ticket.findById(req.params.ticket_id);
	var bookingsPromise = models.booking.findAll({
		where: {
			[Op.or]: [
				{username: req.user.username},
				{booked_by: req.user.username}
			],
			ticket_id: req.params.ticket_id
		},
		include: [
			{model: models.ticket_option_choice, as: "choices"}
		]
	});

	Promise.all([eventPromise, ticketPromise, bookingsPromise]).then(function([event, ticket, bookings]) {
		res.render('events/event_booking', {event: event, ticket: ticket, bookings: bookings});
	}).catch(next);
});

/* POST a booking update */
router.post('/:booking_id', function (req, res, next) {
	var bookingChoices = (req.body.choices === undefined) ? [] : req.body.choices.filter((choice) => (choice !== ""));
	var bookingChoicesPromise = Promise.all(bookingChoices.map((choiceId) => models.ticket_option_choice.findById(choiceId)));

	Promise.all([
		models.booking.findById(req.params.booking_id),
		bookingChoicesPromise,
		models.ticket.findById(req.params.ticket_id),
		models.debt.findOne({where: {booking_id: req.params.booking_id}})
	]).then(function([booking, bookingChoices, ticket, debt]) {
		var baseTicketPrice = (booking.username !== null) ? ticket.price : ticket.price + ticket.guest_surcharge;
		var ticketPrice = baseTicketPrice + bookingChoices.reduce((a, b) => a.price + b.price, 0);
		return Promise.all([
			booking.setChoices(bookingChoices),
			booking.update({notes: req.body.notes}),
			debt.update({amount: ticketPrice})
		]);
	}).then(function() {
		return models.event.findById(req.body.event_id);
	}).then(function(event){
		res.redirect(303, "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+req.params.ticket_id+"/booking?success");
	}).catch(next);
});

/* GET an event */
router.get('/:year/:month/:day/:slug', function (req, res, next) {
	var eventPromise = models.event.findOne({
		where: {
			slug: req.params.slug,
			time: {
				[Op.between]: [
					new Date(req.params.year, req.params.month - 1, req.params.day),
					new Date(req.params.year, req.params.month - 1, req.params.day+1)
				]
			}
		}
	});
	var ticketsPromises = eventPromise.then(function(event) {
		return event.getTickets();
	}).then(function(tickets){
		return Promise.all(tickets.map((ticket) => {
			return Promise.all([
				models.booking.findAll({
					where: {
						[Op.or]: [
							{username: req.user.username},
							{booked_by: req.user.username}
						],
						ticket_id: ticket.id
					},
					include: [
						{model: models.ticket_option_choice, as: "choices"}
					]
				}),
				models.booking.count({where: {ticket_id: ticket.id}})
			]).then(function([ticket, userBookings, bookingCount]){
				ticket.bookings = userBookings;
				ticket.sold = bookingCount;
				return ticket;
			});
		}));
	});

	Promise.all([eventPromise, ticketsPromises]).then(function([event, tickets]) {
		res.render('events/event', {event: event, tickets: tickets});
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
