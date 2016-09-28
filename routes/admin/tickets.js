var express = require('express');
var router = express.Router();
var validator = require('validator');
var treeize   = require('treeize');

var Ticket = require('../../models/ticket')

/* GET tickets page. */
router.get('/', function (req, res, next) {
	Ticket.getAll().then(function (tickets) {
			res.render('admin/tickets', {tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new ticket */
router.post('/', function (req, res, next) {
	Ticket.create(req.body.name).then(function (ticket) {
		res.redirect(303, '/admin/tickets/'+ticket.id)
	}).catch(function (err) {
		next(err);
	});
});

/* GET edit ticket page. */
router.get('/:ticket_id', function (req, res, next) {
	var ticket;
	Ticket.findById(req.params.ticket_id).then(function (data) {
			ticket = data;
			return req.db.manyOrNone('SELECT ticket_options.name, ticket_options.id, ticket_option_choices.id AS "choices:id", ticket_option_choices.name AS "choices:name", ticket_option_choices.price AS "choices:price" FROM ticket_options LEFT JOIN ticket_option_choices ON ticket_options.id=ticket_option_choices.optionid WHERE ticketid=$1', [req.params.ticket_id])
		})
		.then(function (options) {
			var optionsTree = new treeize;
			optionsTree.grow(options);
			res.render('admin/tickets_edit', {ticket: ticket, options: optionsTree.getData()});
		})
		.catch(function (err) {
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

	var price = req.body.price*100;
	var guest_surcharge = req.body.guest_surcharge*100;

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
		});
	}).then(function () {
		res.redirect(303, '/admin/tickets')
	}).catch(function (err) {
		next(err);
	});
});

/* POST a new option */
router.post('/:ticketid/addoption', function (req, res, next) {
	req.db.none('INSERT INTO ticket_options(name, ticketid) VALUES ($1, $2)', [req.body.name, req.params.ticketid])
		.then(function (){
			res.redirect(303, '/admin/tickets/'+req.params.ticketid);
		})
		.catch(function (err) {
			next(err);
		})
});

/* POST an update to an option */
router.post('/:ticketid/:optionid', function (req, res, next) {
	req.db.none('UPDATE ticket_options SET name=$1 WHERE id=$2', [req.body.name, req.params.optionid])
		.then(function (){
			if (!req.body.choice) return;
			query = 'UPDATE ticket_option_choices SET name=choices.name, price=choices.price FROM (VALUES ';
			values = [];
			for (var i = 0; i < req.body.choice.length; i++) {
				if (i!=0) {
					query += ', ';
				}
				query += '($'+(3*i + 1)+', $'+(3*i + 2)+', $'+(3*i + 3)+')';
				values.push(parseInt(req.body.choice[i].id));
				values.push(req.body.choice[i].name);
				values.push(req.body.choice[i].price*100);
			};
			query += ') AS choices(id, name, price) WHERE ticket_option_choices.id=choices.id'
			return req.db.none(query, values);
		})
		.then(function (){
			if (!req.body.newchoice.name) return;
			return req.db.none('INSERT INTO ticket_option_choices(name, price, optionid) VALUES ($1, $2, $3)',[req.body.newchoice.name, req.body.newchoice.price*100, req.params.optionid]);
		})
		.then(function (){
			res.redirect(303, '/admin/tickets/'+req.params.ticketid);
		})
		.catch(function (err) {
			next(err);
		})
});

module.exports = router;
