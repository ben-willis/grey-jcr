var express = require('express');
var router = express.Router();
var validator = require('validator');
var csv = require('csv');

router.use(function (req, res, next) {
	if (req.user.level<5 ) {
		err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	} else {
		return next();
	}
});

/* GET debts page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT SUM(debts.amount) AS amount, users.username, users.name, users.email FROM debts LEFT JOIN users ON debts.username=users.username GROUP BY users.username HAVING SUM(debts.amount)!=0 ORDER BY SUM(amount) DESC')
		.then(function (debtors) {
			res.render('admin/debts', {debtors: debtors});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET debts page. */
router.get('/totals.csv', function (req, res, next) {
	req.db.manyOrNone('SELECT users.username, users.name, users.email, SUM(debts.amount) AS amount FROM debts LEFT JOIN users ON debts.username=users.username GROUP BY users.username HAVING SUM(debts.amount)!=0 ORDER BY SUM(debts.amount) DESC')
		.then(function (debtors) {
			columns = {
				username: 'Username',
				name: 'Name',
				email: 'Email',
				amount: 'Amount'
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
	var debtor;
	req.db.one('SELECT username, name, email FROM users WHERE username=$1', [req.params.username])
		.then(function (data) {
			debtor = data;
			return req.db.many('SELECT debts.id, debts.amount, debts.name, debts.message, users.username, users.name AS user_name FROM users LEFT JOIN debts ON debts.username=users.username WHERE users.username=$1 ORDER BY debts.timestamp DESC', [req.params.username])
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
			res.redirect(303, '/admin/debts/'+req.params.username+'?post-success')
		})
		.catch(function (err){
			next(err);
		})
});

/* DELETE a debt */
router.get('/:username/:debtid/delete', function (req, res, next) {
	req.db.none('DELETE FROM debts WHERE id=$1 AND username=$2', [req.params.debtid, req.params.username])
		.then(function (){
			res.redirect(303, '/admin/debts/'+req.params.username+'?delete-success')
		})
		.catch(function (err) {
			next(err);
		})
});

module.exports = router;
