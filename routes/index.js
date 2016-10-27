var express = require('express');
var htmlToText = require('html-to-text');
var router = express.Router();

var Blog = require('../models/blog');
var Event = require('../models/event');

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
		Blog.getAll(6),
		Event.getFutureEvents(6)
	]).then(function (data){
		blogs = data[0];
		for (blog of blogs) {
			blog.message = htmlToText.fromString(blog.message, {
				wordwrap: false
			}).slice(0, 300) + "...";
		}
		res.render('home', {blogs: blogs, events: data[1]});
	}).catch(function (err) {
		next(err);
	})
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
