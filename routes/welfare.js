var express = require('express');
var router = express.Router();

var Position = require('../models/position')

/* GET home page. */
router.get('/', function (req, res, next) {
		Position.getByType("welfare").then(function(positions) {
			return Promise.all(
				positions.map(function(position) {
					return position.getUsers().then(function(users) {
						position.users = users;
						return position;
					});
				})
			)
		}).then(function (positions) {
			res.render('welfare/index', {welfare: positions});
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;
