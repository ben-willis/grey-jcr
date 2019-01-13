var express = require('express');
var router = express.Router();

var Role = require('../models/role');

/* GET home page. */
router.get('/', function (req, res, next) {
		Promise.all([
			Role.getByType("rep").then(function(roles) {
				if (typeof roles !== 'undefined') {
					return Promise.all(
						roles.map(function(role) {
							return role.getUsers().then(function(users) {
								role.users = users;
								return role;
							});
						})
					);
				}
				return [];
			}),
			Role.getByType("exec").then(function(roles) {
				if (typeof roles !== 'undefined') {
					const reps_officer = roles.find(role => role.title == "Representatives Officer");
					if (typeof reps_officer !== 'undefined') {
						return reps_officer.getUsers().then(function(users) {
							reps_officer.users = users;
							return reps_officer;
						});
					}
				}
				return null;
			}),
			Role.getByType("officer").then(function(roles) {
				if (typeof roles !== 'undefined') {
					const sf_rep = roles.find(role => role.title == "Senior Freshers' Representative");
					if (typeof sf_rep !== 'undefined') {
						return sf_rep.getUsers().then(function(users) {
							sf_rep.users = users;
							return sf_rep;
						});
					}
				}
				return null;
			})
		]).then(function (roles) {
			res.render('reps/index', {reps: roles[0], reps_officer: roles[1], sf_rep: roles[2]});
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;