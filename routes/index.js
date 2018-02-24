var express = require('express');
var htmlToText = require('html-to-text');
var router = express.Router();
var httpError = require('http-errors');

var Blog = require('../models/blog');
var Event = require('../models/event');
var Role = require('../models/role');

var auth = require('./auth');
var jcr = require('./jcr');
var services = require('./services');
var info = require('./info');
var support = require('./support');
var facilities = require('./facilities');
var events = require('./events');
var welfare = require('./welfare');
var sportsandsocs = require('./sportsandsocs');
var mcr = require('./mcr');
var api = require('./api');

/* GET home page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Blog.get(),
		Event.getFutureEvents(6),
		Role.getByType("exec").then(function(exec_members) {
			return Promise.all(
				exec_members.map(function(exec_member) {
					return exec_member.getUsers().then(function(users) {
						exec_member.users = users;
						return exec_member;
					});
				})
			);
		})
	]).then(function (data){
		var blogs = data[0].splice(0,9);
		for (blog of blogs) {
			blog.message = htmlToText.fromString(blog.message, {
				wordwrap: false,
				ignoreHref: true,
				ignoreImage: true
			}).slice(0, 200) + "...";
		}
		res.render('home', {blogs: blogs, events: data[1], exec: data[2]});
	}).catch(function (err) {
		next(err);
	});
});

/* GET offline page */
router.get('/offline', function(req,res,next) {
	res.render('error', {
		message: "Disconnected",
		error: {status: "We were unable to load the page you requested. Please check your network connection and try again."}
	});
});

router.use('/', auth);
router.use('/jcr/', jcr);
router.use('/services/', services);
router.use('/info/', info);
router.use('/support/', support);
router.use('/facilities/', facilities);
router.use('/events/', events);
router.use('/welfare/', welfare);
router.use('/sportsandsocs/', sportsandsocs);
router.use('/mcr/', mcr);
router.use('/api/', api);

module.exports = router;
