var express = require('express');
var router = express.Router();
var validator = require('validator');
var csv = require('csv');
var httpError = require('http-errors');

var Ticket = require('../../models/ticket');
var Booking = require('../../models/booking');
var User = require('../../models/user');

router.use(function (req, res, next) {
	if (req.user.level < 4) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET tickets page. */
router.get('/', function (req, res, next) {
	Ticket.getAll()
		.then(function (tickets) {
			return Promise.all(
				tickets.map(function(ticket) {
					return Booking.countByTicketId(ticket.id).then(function(booking_count) {
						ticket.sold = booking_count;
						return ticket;
					});
				})
			);
		}).then(function(tickets ){
			res.render('admin/tickets', {tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new ticket */
router.post('/', function (req, res, next) {
	Ticket.create(req.body.name).then(function (ticket) {
		res.redirect(303, '/admin/tickets/'+ticket.id);
	}).catch(function (err) {
		next(err);
	});
});

/* GET edit ticket page. */
router.get('/:ticket_id', function (req, res, next) {
	Ticket.findById(req.params.ticket_id).then(function (ticket) {
		res.render('admin/tickets_edit', {ticket: ticket});
	}).catch(function (err) {
		next(err);
	});
});

/* GET delete a ticket page. */
router.get('/:ticket_id/delete', function (req, res, next) {
	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.delete();
	}).then(function () {
		res.redirect(303, '/admin/tickets');
	}).catch(function (err) {
		next(err);
	});
});

/* POST an editted ticket */
router.post('/:ticket_id', function (req, res, next) {
	var date = (req.body.open_booking_date).split('-'); var time = (req.body.open_booking_time).split(':');
	var open_booking = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	date = (req.body.close_booking_date).split('-'); time = (req.body.close_booking_time).split(':');
	var close_booking = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	if (close_booking < open_booking) {
		err = new Error("Close of booking must be after open of booking");
		err.status(400);
		next(err);
	} else if (req.body.max_booking < req.body.min_booking) {
		err = new Error("Max booking must be greater than or equal to min booking");
		err.status(400);
		next(err);
	}

	var allow_debtors = (req.body.allow_debtors=='on');
	var allow_guests = (req.body.allow_guests=='on');

	var price = Math.round(req.body.price*100);
	var guest_surcharge = req.body.guest_surcharge*100;

	if (!req.body.options)
		req.body.options = []
	for (var i = 0; i < req.body.options.length; i++) {
		req.body.options[i].choices = req.body.options[i].choices.filter(function(choice){ return choice != undefined });
		for (var j = 0; j < req.body.options[i].choices.length; j++) {
			req.body.options[i].choices[j].price = req.body.options[i].choices[j].price * 100;
		}
	}

	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.update(req.body.name, {
			max_booking: parseInt(req.body.max_booking),
	        min_booking: parseInt(req.body.min_booking),
	        allow_debtors: allow_debtors,
	        allow_guests: allow_guests,
	        open_booking: open_booking,
	        close_booking: close_booking,
	        price: price,
	        guest_surcharge: guest_surcharge,
			stock: Math.max(req.body.stock, 0)
		})
	}).then(function () {
		res.redirect(303, '/admin/tickets');
	}).catch(function (err) {
		next(err);
	});
});

/* POST a new option*/
router.post('/:ticket_id/options', function(req, res, next) {
	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.addOption(req.body.name);
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* POST rename an option */
router.post('/:ticket_id/options/:option_id', function(req, res, next) {
	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.renameOption(req.params.option_id, req.body.name);
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* GET delete a option */
router.get('/:ticket_id/options/:option_id/delete', function(req, res, next) {
	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.removeOption(req.params.option_id);
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* POST a new choice */
router.post('/:ticket_id/options/:option_id/choices', function(req, res, next) {
	price = Math.floor(parseFloat(req.body.price)*100);
	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.addChoice(req.params.option_id, req.body.name, price);
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* POST update a choice */
router.post('/:ticket_id/options/:option_id/choices/:choice_id', function(req, res, next) {
	price = Math.floor(parseFloat(req.body.price)*100);
	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.updateChoice(req.params.choice_id, req.body.name, price);
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* GET remove a choice */
router.get('/:ticket_id/options/:option_id/choices/:choice_id/delete', function(req, res, next) {
	Ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.removeChoice(req.params.choice_id);
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* GET ticket bookings */
router.get('/:ticket_id/*-bookings.csv', function(req, res, next) {
	var ticket = null;
	var columns = null;
	var options = {};
	var choices = {};
	var bookings_data = [];
	Ticket.findById(parseInt(req.params.ticket_id))
		.then(function(data) {
			ticket = data;
			columns = {
				booked_by: "Booked By",
				name: "Name",
				guest: "Guest",
				email: "Email",
				notes: "Notes"
			};

			for (option of ticket.options) {
				columns[option.id] = option.name;
				options[option.id] = {};
				for (choice of option.choices) {
					choices[choice.id] = option.id;
					options[option.id][choice.id] = choice.name;
				}
			}
			return Booking.getByTicketId(req.params.ticket_id);
		})
		.then(function(bookings) {
			return Promise.all(
				bookings.map(function(booking) {
					var username = (booking.username == null) ? booking.booked_by : booking.username;
					return User.findByUsername(username).then(function(user) {
						var name = (booking.username == null) ? booking.guestname : user.name;
						booking_data = {
							booked_by: booking.booked_by,
							name: name,
							guest: (booking.username == null),
							email: user.email,
							notes: booking.notes
						};
						
						if (ticket.options == []) return booking_data;

						for (choice of booking.choices) {
							option_id = choices[choice];
							booking_data[option_id] = options[option_id][choice]
						}
						return booking_data;
					});
				})
			);
		})
		.then(function(bookings){
			csv.stringify(bookings, {header: true, columns: columns}, function (err, output) {
				if (err) throw err;
				res.set('Content-Type', 'text/csv');
				res.status(200).send(output);
			});
		})
		.catch(function (err){
			next(err);
		});
})
;
module.exports = router;
