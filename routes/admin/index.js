var express = require('express');
var router = express.Router();
var httpError = require('http-errors');

var User = require('../../models/user');

var roles = require('./roles');
var blog = require('./blog');
var feedback = require('./feedback');
var events = require('./events');
var debts = require('./debts');
var tickets = require('./tickets');
var societies = require('./societies');
var elections = require('./elections');
var rooms = require('./rooms');
var files = require('./files');

router.use(function (req, res, next) {
	//Check User Authenticated
	if (!req.isAuthenticated()) {
		req.session.redirect_to = req.originalUrl;
		return res.redirect(401, '/login?unauthorised');
	} else if (req.user.level < 3) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('admin/home');
});

router.post('/adduser', function(req, res, next) {
	User.create(req.body.username).then(function(user) {
		res.json({success: true, user: user})
	}).catch(next)
})

router.use('/roles', roles);
router.use('/blog', blog);
router.use('/feedback', feedback);
router.use('/events', events);
router.use('/debts', debts);
router.use('/tickets', tickets);
router.use('/societies', societies);
router.use('/elections', elections);
router.use('/rooms', rooms);
router.use('/files', files);


module.exports = router;
