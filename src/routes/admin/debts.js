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

import DebtsService from "../../debts/DebtsService";
import { getConnection } from "typeorm";

const debtsService = new DebtsService(getConnection("grey"));

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
		.catch(function (err) {
			next(err);
		});
});

/* GET debts page. */
router.get('/:username', async function (req, res, next) {
	try {
		const debtor = await User.findByUsername(req.params.username);
		const debts = await debtsService.getDebts(req.params.username);
		const sortedDebts = debts.sort((debtA, debtB) => {
			let dateA = new Date(debtA.added);
			let dateB = new Date(debtB.added);

			console.log(dateA + ' | ' + dateB);

			if (dateA < dateB) {
				return 1;
			}
			return -1;
		});

		res.render("admin/debts_individual", {debts: sortedDebts, debtor});
	} catch (err) {
		next(err);
	}
});

/* POST a new debt */
router.post('/:username', function (req, res, next) {
	var amount = Math.floor(req.body.amount*100);
	debtsService.addDebt({
		name: req.body.name,
		message: req.body.message,
		amount,
		username: req.params.username
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
					if (row.length != 2) throw httpError(400, "CSV should have two columns");
					if (!Number.isInteger(Number(row[1]))) throw httpError(400, "The second column should be the amount of debt in pence");
					return debtsService.addDebt({
						name: req.body.name,
						message: req.body.message,
						username: row[0],
						amount: row[1]
					});
				})
			).then(function(){
				res.redirect(303, '/admin/debts/?post-success');
			}).catch(next);
		});
	});
});

module.exports = router;
