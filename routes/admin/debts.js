var express = require('express');
var router = express.Router();
var validator = require('validator');
var csv = require('csv');
var httpError = require('http-errors');

var User = require('../../models/user');

router.use(function (req, res, next) {
	if (req.user.level < 5) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET debts page. */
router.get('/', function (req, res, next) {
	User.getDebtors()
		.then(function (debtors) {
			res.render('admin/debts', {debtors: debtors});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET debts page. */
router.get('/totals.csv', function (req, res, next) {
	User.getDebtors()
		.then(function (debtors) {
			columns = {
				username: 'Username',
				name: 'Name',
				email: 'Email',
				sum: 'Amount'
			}
			csv.stringify(debtors, {header: true, columns: columns}, function (err, output) {
				if (err) throw err;
				res.set('Content-Type', 'text/csv');
				res.status(200).send(output);
			})
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET debts page. */
router.get('/:username', function (req, res, next) {
	var user;
	User.findByUsername(req.params.username)
		.then(function(data) {
			user = data;
			return user.getDebts();
		})
		.then(function (debts) {
			res.render('admin/debts_individual', {debts: debts, debtor: user});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new debt */
router.post('/:username', function (req, res, next) {
	amount = Math.floor(req.body.amount*100);
	User.findByUsername(req.params.username)
		.then(function(user) {
			return user.addDebt(req.body.name, req.body.message, amount);
		})
		.then(function() {
			res.redirect(303, '/admin/debts/'+req.params.username+'?post-success')
		})
		.catch(function (err){
			next(err);
		})
});

module.exports = router;
