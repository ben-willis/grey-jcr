var express = require('express');
var router = express.Router();

var Role = require('../models/role');

/* GET home page. */
router.get('/', function (req, res, next) {
		Role.getByType("welfare").then(function(roles) {
			return Promise.all(
				roles.map(function(role) {
					return role.getUsers().then(function(users) {
						role.users = users;
						return role;
					});
				})
			);
		}).then(function (roles) {
			res.render('welfare/index', {welfare: roles});
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;
