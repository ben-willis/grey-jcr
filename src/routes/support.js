var express = require('express');
var router = express.Router();

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

var models = require("../models");

/* GET home page. */
router.get('/', function (req, res, next) {
	models.role.findAll({
		where: {
			level: {
				[Op.eq]: 1
			}
		},
		include: models.user
	}).then(function (reps) {
		res.render('support/index', {reps: reps});
	}).catch(next);
});

module.exports = router;
