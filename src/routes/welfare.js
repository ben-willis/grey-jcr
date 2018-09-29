var express = require('express');
var router = express.Router();

const Op = require("sequelize").Op;

var models = require('../models');

/* GET home page. */
router.get('/', function (req, res, next) {
	models.role.findAll({
		where: {
			[Op.or]: [
				{level: 2},
				{slug: "male-welfare-officer"},
				{slug: "female-welfare-officer"}
			]
		},
		include: [models.user]
	}).then(function (roles) {
		res.render('welfare/index', {welfare: roles});
	}).catch(next);
});

module.exports = router;
