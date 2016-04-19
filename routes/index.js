var express = require('express');
var router = express.Router();

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
	var blog;
	req.db.manyOrNone("SELECT blog.title, blog.message, blog.timestamp, blog.slug, users.name, users.username, positions.title AS position_title, positions.slug AS position_slug FROM blog LEFT JOIN users ON blog.author=users.username LEFT JOIN positions ON blog.positionid=positions.id ORDER BY timestamp DESC LIMIT 7")
		.then(function (posts) {
			blog = posts;
			return req.db.manyOrNone("SELECT events.name, events.timestamp, events.slug, events.image FROM events WHERE timestamp>NOW() ORDER BY timestamp ASC LIMIT 6");
		}).then(function (events){
			res.render('home', {blog: blog, events: events});
		})
		.catch(function (err) {
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
