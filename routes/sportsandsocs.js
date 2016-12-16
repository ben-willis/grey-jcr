var express = require('express');
var router = express.Router();

var Society = require('../models/society');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('sportsandsocs/index')
});

module.exports = router;
