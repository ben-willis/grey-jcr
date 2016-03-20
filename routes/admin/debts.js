var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET debts page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT SUM(debts.amount) AS amount, users.username, users.name, users.email FROM debts LEFT JOIN users ON debts.username=users.username GROUP BY users.username ORDER BY SUM(amount) DESC LIMIT 20')
		.then(function (debtors) {
			res.render('admin/debts', {debtors: debtors});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET debts page. */
router.get('/:username', function (req, res, next) {
	req.db.many('SELECT debts.amount, debts.name, debts.message, users.username, users.name AS user_name FROM users LEFT JOIN debts ON debts.username=users.username WHERE users.username=$1', [req.params.username])
		.then(function (debts) {
			res.render('admin/debts_individual', {debts: debts});
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
