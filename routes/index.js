var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Position = require('../models/position');
var Blog = require('../models/blog');

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
						return blog.getPosition();
					}).then(function(position) {
						blog.position = position;
						return blog;
					})
				})
			)
		}),
		req.db.manyOrNone("SELECT events.name, events.timestamp, events.slug, events.image FROM events WHERE timestamp>NOW() ORDER BY timestamp ASC LIMIT 6")
	]).then(function (data){
		res.render('home', {blogs: data[0], events: data[1]});
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
