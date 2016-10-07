var express = require('express');
var router = express.Router();

var Role = require('../models/role')

/* GET home page. */
router.get('/', function (req, res, next) {
		Role.getByType("rep").then(function(roles) {
			return Promise.all(
				roles.map(function(role) {
					return role.getUsers().then(function(users) {
						role.users = users;
						return role;
					});
				})
			)
		}).then(function (reps) {
			res.render('support/index', {reps: reps});
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;
