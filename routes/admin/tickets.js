var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET tickets page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT id, name, stock FROM tickets')
		.then(function (tickets) {
			res.render('admin/tickets', {tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new ticket */
router.post('/', function (req, res, next) {
	req.db.one('INSERT INTO tickets(name, max_booking) VALUES ($1, $2) RETURNING id', [req.body.name, 8])
		.then(function (ticket) {
			res.redirect(303, '/admin/tickets/'+ticket.id)
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET edit ticket page. */
router.get('/:ticketid', function (req, res, next) {
	req.db.one('SELECT id, name, max_booking, min_booking, block_debtors, guests, stock FROM tickets WHERE id=$1',[req.params.ticketid])
		.then(function (ticket) {
			res.render('admin/tickets_edit', {ticket: ticket});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET delete a ticket page. */
router.get('/:ticketid/delete', function (req, res, next) {
	req.db.none('DELETE FROM tickets WHERE id=$1', [req.params.ticketid])
		.then(function () {
			res.redirect(303, '/admin/tickets');
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST an editted ticket */
router.post('/:ticketid', function (req, res, next) {
	req.db.none('UPDATE tickets SET name=$2, max_booking=$3, min_booking=$4, block_debtors=$5, guests=$6, stock=$7 WHERE id=$1', [req.params.ticketid, req.body.name, req.body.max_booking, req.body.min_booking, req.body.block_debtors, req.body.guests, req.body.stock])
		.then(function () {
			res.redirect(303, '/admin/tickets')
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
