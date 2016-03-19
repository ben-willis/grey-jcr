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
	req.db.one('SELECT id, name, max_booking, min_booking, block_debtors, guests, stock, open_sales, close_sales FROM tickets WHERE id=$1',[req.params.ticketid])
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
	console.log(req.body);
	var date = (req.body.open_sales_date).split('-'); var time = (req.body.open_sales_time).split(':');
	var open_sales = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	date = (req.body.close_sales_date).split('-'); time = (req.body.close_sales_time).split(':');
	var close_sales = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);

	if (close_sales < open_sales) {
		err = new Error("Close of booking must be after open of booking");
		next(err);
	} else if (req.body.max_booking < req.body.min_booking) {
		err = new Error("Max booking must be greater than or equal to min booking");
		next(err);
	}
	
	var block_debtors = (req.body.block_debtors=='on');
	var guests = (req.body.guests=='on');
	req.db.none('UPDATE tickets SET name=$2, max_booking=$3, min_booking=$4, block_debtors=$5, guests=$6, stock=$7, open_sales=$8, close_sales=$9 WHERE id=$1', [req.params.ticketid, req.body.name, req.body.max_booking, req.body.min_booking, block_debtors, guests, req.body.stock, open_sales, close_sales])
		.then(function () {
			res.redirect(303, '/admin/tickets')
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
