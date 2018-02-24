var express = require('express');
var router = express.Router();
var validator = require('validator');
var csv = require('csv');
var fs = require('fs');
var httpError = require('http-errors');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mime = require('mime');

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
				total_debt: 'Amount'
			};
			csv.stringify(debtors, {header: true, columns: columns}, function (err, output) {
				if (err) throw err;
				res.set('Content-Type', 'text/csv');
				res.status(200).send(output);
			});
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
		});
});

/* POST a batch of debts */
router.post('/', upload.single('debts'), function(req, res, next){
	if (!req.file) return next(httpError(400, "No file uploaded"));
	fs.readFile(req.file.path, 'utf8', function(err, data) {
		if (err) return next(err);
		csv.parse(data, function(err, data) {
			if (err) return next(err);
			Promise.all(
				data.map(function(row){
					return User.findByUsername(row[0]).then(function(user){
						if (row.length != 2) throw httpError(400, "CSV should have two columns");
						if (!Number.isInteger(Number(row[1]))) throw httpError(400, "The second column should be the amount of debt in pence");
						return;
					});
				})
			).then(function(){
				return Promise.all(
					data.map(function(row){
						return User.findByUsername(row[0]).then(function(user){
							return user.addDebt(req.body.name, req.body.message, row[1]);
						});
					})
				);
			}).then(function(){
				res.redirect(303, '/admin/debts/?post-success');
			}).catch(function(err){
				return next(err);
			});
		});
	});
});

module.exports = router;
