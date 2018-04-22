var express = require('express');
var router = express.Router();
var validator = require('validator');
var csv = require('csv');
var fs = require('fs');
var httpError = require('http-errors');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mime = require('mime');

var models = require("../../models");

router.use(function (req, res, next) {
	if (req.user.level < 5) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET debts page. */
router.get('/', function (req, res, next) {
	models.user.findAll({include: [models.debt]}).then(function (users) {
		var debtors = users.map((user) => {
			user.total_debt = user.debts.reduce((debt1, debt2) => debt1.amount + debt2.amount, 0);
			return user;
		}).filter((debtor) => (debtor.total_debt !== 0));
		res.render('admin/debts', {debtors: debtors});
	}).catch(next);
});

/* GET debts page. */
router.get('/totals.csv', function (req, res, next) {

	models.user.findAll({include: [models.debt]}).then(function (users) {
		var debtors = users.map((user) => {
			user.total_debt = user.debts.reduce((debt1, debt2) => debt1.amount + debt2.amount, 0);
			return user;
		}).filter((debtor) => (debtor.total_debt !== 0));
		var columns = {
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
	.catch(next);
});

/* GET debts page. */
router.get('/:username', function (req, res, next) {
	models.user.findById(req.params.username, {include: [models.debt]}).then(function(user) {
			res.render('admin/debts_individual', {debts: user.debts, debtor: user});
	}).catch(next);
});

/* POST a new debt */
router.post('/:username', function (req, res, next) {
	var amount = Math.floor(req.body.amount*100);
	models.user.findById(req.params.username).then(function(user) {
		return user.addDebt({
			name: req.body.name,
			message: req.body.message,
			amount: amount
		});
	}).then(function() {
		res.redirect(303, '/admin/debts/'+req.params.username+'?post-success');
	}).catch(next);
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
					return models.user.findById(row[0]).then(function(user){
						if (row.length != 2) throw httpError(400, "CSV should have two columns");
						if (!Number.isInteger(Number(row[1]))) throw httpError(400, "The second column should be the amount of debt in pence");
						return;
					});
				})
			).then(function(){
				return Promise.all(
					data.map(function(row){
						return models.user.findById(row[0]).then(function(user){
							return user.addDebt({
								name: req.body.name,
								message: req.body.message,
								amount: row[1]
							});
						});
					})
				);
			}).then(function(){
				res.redirect(303, '/admin/debts/?post-success');
			}).catch(next);
		});
	});
});

module.exports = router;
