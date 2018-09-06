var express = require('express');
var router = express.Router();
var httpError = require('http-errors');

router.use(function (req, res, next) {
	//Check User Authenticated
	if (!req.isAuthenticated()) {
		req.session.redirect_to = req.originalUrl;
		return res.redirect(401, '/login?unauthorised');
	} else {
		return next();
	}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('freshers/index');
});

module.exports = router;
