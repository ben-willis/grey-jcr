var express = require('express');
var router = express.Router();

var positions = require('./positions');
var blog = require('./blog');
var feedback = require('./feedback');
var events = require('./events');
var elections = require('./elections');
var files = require('./files');

router.use(function (req, res, next) {
	//Check User Authenticated
	if (!req.isAuthenticated()) {
		req.session.redirect_to = req.originalUrl;
		return res.redirect(401, '/login?unauthorised');
	} else if (req.user.level<4 ) {
		err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	} else {
		return next();
	}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('admin/home');
});

router.use('/positions', positions);
router.use('/blog', blog);
router.use('/feedback', feedback);
router.use('/events', events);
router.use('/elections', elections);
router.use('/files', files);


module.exports = router;