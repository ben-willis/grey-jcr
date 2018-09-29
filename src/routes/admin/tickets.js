var express = require('express');
var router = express.Router();
var csv = require('csv');
var httpError = require('http-errors');

const models = require("../../models");

router.use(function (req, res, next) {
	if (req.user.level < 4) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET tickets page. */
router.get('/', function (req, res, next) {
	models.ticket.findAll().then(function (tickets) {
		return Promise.all(
			tickets.map(function(ticket) {
				return models.booking.count({where: {ticket_id: ticket.id}}).then(function(bookingCount) {
					ticket.sold = bookingCount;
					return ticket;
				});
			})
		);
	}).then(function(tickets){
		res.render('admin/tickets', {tickets: tickets});
	}).catch(next);
});

/* POST a new ticket */
router.post('/', function (req, res, next) {
	models.ticket.create({
		name: req.body.name
	}).then(function (ticket) {
		res.redirect(303, '/admin/tickets/'+ticket.id);
	}).catch(next);
});

/* GET edit ticket page. */
router.get('/:ticket_id', function (req, res, next) {
	models.ticket.findById(req.params.ticket_id, {
		include: [{
			model: models.ticket_option,
			as: "options",
			include: [{
				model: models.ticket_option_choice,
				as: "choices"
			}]
		}]
	}).then(function (ticket) {
		res.render('admin/tickets_edit', {ticket: ticket});
	}).catch(next);
});

/* GET delete a ticket page. */
router.get('/:ticket_id/delete', function (req, res, next) {
	models.ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.destroy();
	}).then(function () {
		res.redirect(303, '/admin/tickets');
	}).catch(next);
});

/* POST an editted ticket */
router.post('/:ticket_id', function (req, res, next) {
	var date = (req.body.open_booking_date).split('-'); var time = (req.body.open_booking_time).split(':');
	var open_booking = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	date = (req.body.close_booking_date).split('-'); time = (req.body.close_booking_time).split(':');
	var close_booking = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	if (close_booking < open_booking) {
		let err = new Error("Close of booking must be after open of booking");
		err.status(400);
		next(err);
	} else if (req.body.max_booking < req.body.min_booking) {
		let err = new Error("Max booking must be greater than or equal to min booking");
		err.status(400);
		next(err);
	}

	var allow_debtors = (req.body.allow_debtors=='on');
	var allow_guests = (req.body.allow_guests=='on');

	var price = Math.round(req.body.price*100);
	var guest_surcharge = req.body.guest_surcharge*100;

	models.ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.update({
			name: req.body.name,
			max_booking: parseInt(req.body.max_booking),
	    min_booking: parseInt(req.body.min_booking),
	    allow_debtors: allow_debtors,
	    allow_guests: allow_guests,
	    open_booking: open_booking,
	    close_booking: close_booking,
	    price: price,
	    guest_surcharge: guest_surcharge,
			stock: Math.max(req.body.stock, 0)
		});
	}).then(function () {
		res.redirect(303, '/admin/tickets');
	}).catch(next);
});

/* POST a new option*/
router.post('/:ticket_id/options', function(req, res, next) {
	models.ticket.findById(req.params.ticket_id).then(function(ticket) {
		return ticket.createOption({
			name: req.body.name
		});
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* POST rename an option */
router.post('/:ticket_id/options/:option_id', function(req, res, next) {
	models.ticket_option.findById(req.params.option_id).then(function(option) {
		return option.update({
			name: req.body.name
		});
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* GET delete a option */
router.get('/:ticket_id/options/:option_id/delete', function(req, res, next) {
	models.ticket_option.findById(req.params.option_id).then(function(ticket) {
		return ticket.destroy();
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* POST a new choice */
router.post('/:ticket_id/options/:option_id/choices', function(req, res, next) {
	var price = Math.floor(parseFloat(req.body.price)*100);
	models.ticket_option.findById(req.params.option_id).then(function(option) {
		return option.createChoice({
			name: req.body.name,
			price: price
		});
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* POST update a choice */
router.post('/:ticket_id/options/:option_id/choices/:choice_id', function(req, res, next) {
	var price = Math.floor(parseFloat(req.body.price)*100);
	models.ticket_option_choice.findById(req.params.choice_id).then(function(choice) {
		return choice.update({
			name: req.body.name,
			price: price
		});
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* GET remove a choice */
router.get('/:ticket_id/options/:option_id/choices/:choice_id/delete', function(req, res, next) {
	models.ticket_option_choice.findById(req.params.choice_id).then(function(ticket) {
		return ticket.destroy();
	}).then(function () {
		res.redirect(303, '/admin/tickets/'+req.params.ticket_id);
	}).catch(next);
});

/* GET ticket bookings */
router.get('/:ticket_id/*-bookings.csv', function(req, res, next) {
	var columns = null;
	var options = {};
	var choices = {};
	var bookings_data = [];

	var ticketPromise = models.ticket.findById(req.params.ticket_id, {
		include: [{
			model: models.ticket_option,
			as: "options",
			include: [{
				model: models.ticket_option_choice,
				as: "choices"
			}]
		}]
	});

	ticketPromise.then(function(ticket) {
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
		return models.booking.findAll({
			where: {ticket_id: req.params.ticket_id},
			include: [{
				model: models.ticket_option_choice,
				as: "choices"
			}]
		});
	}).then(function(bookings) {
		return Promise.all(
			bookings.map(function(booking) {
				var username = (booking.username === null) ? booking.booked_by : booking.username;
				return models.user.findById(username).then(function(user) {
					var name = (booking.username === null) ? booking.guestname : user.name;
					var booking_data = {
						booked_by: booking.booked_by,
						name: name,
						guest: (booking.username === null),
						email: user.email,
						notes: booking.notes
					};
					
					if (options == []) return booking_data;

					for (choice of booking.choices) {
						option_id = choices[choice];
						booking_data[option_id] = options[option_id][choice]
					}
					return booking_data;
				});
			})
		);
	}).then(function(bookings){
		csv.stringify(bookings, {header: true, columns: columns}, function (err, output) {
			if (err) throw err;
			res.set('Content-Type', 'text/csv');
			res.status(200).send(output);
		});
	}).catch(next);
});

module.exports = router;
