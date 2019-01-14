var express = require('express');
var router = express.Router();
var slug = require('slug');

var Role = require('../models/role');

/* GET home page. */
router.get('/', function (req, res, next) {
	Role.findBySlug(slug("Tech Officer")).then(function (role) {
		return role.getUsers().then(function(users) {
			role.users = users;
			return role;
		});
	}).then(function (tech) {
		res.render('tech/index', {tech: tech});
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
