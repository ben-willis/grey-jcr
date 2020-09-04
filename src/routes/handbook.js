var express = require('express');
var router = express.Router();
var httpError = require('http-errors');



/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('handbook/index');
});

module.exports = router;
