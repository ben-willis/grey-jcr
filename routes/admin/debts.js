var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET debts page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT SUM(debts.amount) AS amount, users.username, users.name, users.email FROM debts LEFT JOIN users ON debts.username=users.username GROUP BY users.username HAVING SUM(debts.amount)>0 ORDER BY SUM(amount) DESC')
		.then(function (debtors) {
			res.render('admin/debts', {debtors: debtors});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET debts page. */
router.get('/:username', function (req, res, next) {
	var debtor;
	req.db.one('SELECT username, name, email FROM users WHERE username=$1', [req.params.username])
		.then(function (data) {
			debtor = data;
			return req.db.many('SELECT debts.amount, debts.name, debts.message, users.username, users.name AS user_name FROM users LEFT JOIN debts ON debts.username=users.username WHERE users.username=$1 ORDER BY debts.timestamp DESC', [req.params.username])
		})
		.then(function (debts) {
			res.render('admin/debts_individual', {debts: debts, debtor: debtor});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST an alteration */
router.post('/:username', function (req, res, next) {
	amount = Math.floor(req.body.amount*100);
	req.db.none('INSERT INTO debts(name, message, amount, username) VALUES ($1, $2, $3, $4)', [req.body.name, req.body.message, amount, req.params.username])
		.then(function() {
			res.redirect(303, '/admin/debts/'+req.params.username)
		})
		.catch(function (err){
			next(err);
		})
});

module.exports = router;
