var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Role = require('../models/role');
var Blog = require('../models/blog');
var Event = require('../models/event');

var auth = require('./auth');
var jcr = require('./jcr');
var services = require('./services');
var support = require('./support');
var facilities = require('./facilities');
var events = require('./events');
var welfare = require('./welfare');
var sportsandsocs = require('./sportsandsocs');
var prospective = require('./prospective');
var mcr = require('./mcr');
var api = require('./api');

/* GET home page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Blog.getAll().then(function(blogs) {
			return Promise.all(
				blogs.map(function(blog) {
					return blog.getAuthor().then(function(author) {
						blog.author = author;
						return blog.getRole();
					}).then(function(role) {
						blog.role = role;
						return blog;
					})
				})
			)
		}),
		Event.getFutureEvents()
	]).then(function (data){
		res.render('home', {blogs: data[0], events: data[1].slice(0, 6)});
	}).catch(function (err) {
		next(err);
	})
});

router.use('/', auth);
router.use('/jcr/', jcr);
router.use('/services/', services);
router.use('/support/', support);
router.use('/facilities/', facilities);
router.use('/events/', events);
router.use('/welfare/', welfare);
router.use('/sportsandsocs/', sportsandsocs);
router.use('/prospective/', prospective);
router.use('/mcr/', mcr);
router.use('/api/', api);

module.exports = router;
