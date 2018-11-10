var express = require('express');
var router = express.Router();

var Role = require('../models/role');

/* GET home page. */
router.get('/', function (req, res, next) {
		Promise.all([
			Role.getByType("rep").then(function(roles) {
				return Promise.all(
					roles.map(function(role) {
						return role.getUsers().then(function(users) {
							role.users = users;
							return role;
						});
					})
				);
			}),
			Role.getByType("exec").then(function(roles) {
				const reps_officer = roles.find(role => role.title == "Representatives Officer");
				return reps_officer.getUsers().then(function(users) {
					reps_officer.users = users;
					return reps_officer;
				});
			}),
			Role.getByType("officer").then(function(roles) {
				const sf_rep = roles.find(role => role.title == "Senior Freshers' Representative");
				return sf_rep.getUsers().then(function(users) {
					sf_rep.users = users;
					return sf_rep;
				});
			})
		]).then(function (roles) {
			res.render('support/index', {reps: roles[0], reps_officer: roles[1], sf_rep: roles[2]});
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;
