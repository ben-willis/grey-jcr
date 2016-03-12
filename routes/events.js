var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT name, timestamp, image, slug FROM events WHERE timestamp>NOW() ORDER BY timestamp ASC')
		.then(function (events) {
			res.render('events/index', {events: events});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET calendar page. */
router.get('/calendar/:year?/:month?', function (req, res, next) {
	var year = (isNaN(req.params.year)) ? (new Date()).getFullYear() : req.params.year;
	var month = (isNaN(req.params.month)) ? (new Date()).getMonth()+1 : req.params.month;
	req.db.manyOrNone("SELECT id, name, timestamp, slug FROM events WHERE EXTRACT(YEAR FROM timestamp)=$1 AND EXTRACT(MONTH FROM timestamp)=$2 ORDER BY timestamp ASC", [year, month])
		.then(function (events) {
			res.render('events/calendar', {events: events, month: month, year: year});
		})
		.catch(function (err) {
			next(err);
		});
});

router.get('/:year/:month/:slug', function (req, res, next) {
	req.db.one("SELECT id, name, slug, description, timestamp FROM events WHERE date_part('year', events.timestamp)=$1 AND date_part('month', events.timestamp)=$2 AND slug=$3", [req.params.year, req.params.month, req.params.slug])
		.then(function (event) {
			res.render('events/event', {event: event});
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
