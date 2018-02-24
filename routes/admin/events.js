var express = require('express');
var router = express.Router();
var validator = require('validator');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var csv = require('csv');
var slug = require('slug');
var shortid = require('shortid');
var fs = require('fs');
var httpError = require('http-errors');


var io = require('../../helpers/socketApi.js').io;

var Event = require('../../models/event');
var Ticket = require('../../models/ticket');
var User = require('../../models/user');
var valentines = require('../../models/valentines');


/* GET events page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Event.getFutureEvents(),
		Event.getPastEvents(),
		valentines.getStatus()
	]).then(function (data) {
		res.render('admin/events', {future_events: data[0], past_events: data[1], valentines_swapping_open: data[2]});
	}).catch(function (err) {
		next(err);
	});
});

/* POST a new events */
router.post('/new', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var time = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	Event.create(req.body.name, req.body.description, time, null).then(function (event){
		res.redirect('/admin/events/'+event.id+'/edit');
	}).catch(function (err) {
		next(err);
	});
});

router.post('/valentines/pairs', upload.single('pairs'), function(req, res, next) {
	if (!req.file) return next(httpError(400, "No file uploaded"));
	fs.readFile(req.file.path, 'utf8', function(err, data) {
		if (err) return next(err);
		csv.parse(data, function(err, data) {
			if (err) return next(err);
			Promise.all([
				valentines.clearPairs(),
				valentines.clearSwaps()
			]).then(function() {
				return Promise.all(
					data.map(function(row, index){
						if (row.length != 2) return httpError(400, "CSV should have two columns");
						return valentines.createPair(row[0], row[1], index)
					})
				)
			}).then(function(){
				res.redirect(303, '/admin/events');
			}).catch(function(err){
				return next(err);
			})
		})
	})
})

router.get('/valentines/open', function(req, res, next) {
	valentines.setStatus(true).then(function() {
		res.redirect('/admin/events');
	}).catch(function (err) {
		return next(err);
	});
});

router.get('/valentines/close', function(req, res, next) {
	valentines.setStatus(false).then(function() {
		io.emit('close_swapping');
		res.redirect('/admin/events');
	}).catch(function (err) {
		return next(err);
	});
});

router.get('/valentines/debts', function(req, res, next) {
	valentines.getDebts().then(function(debtors) {
		Promise.all(debtors.map(function(debtor) {
			return User.addDebtToUsername(debtor.username, 'Valentines Swapping', '', debtor.debt);
		}))
	}).then(function(){
		return valentines.clearDebts();
	}).then(function(){
		res.redirect('/admin/events');
	}).catch(function (err) {
		return next(err);
	});
});

/* GET edit events page. */
router.get('/:event_id/edit', function (req, res, next) {
	var event;
	Event.findById(parseInt(req.params.event_id)).then(function (data) {
		event = data;
		return Promise.all([
			event.getTickets(),
			Ticket.getAll()
		])
	}).then(function (data) {
		event.tickets = data[0];
		res.render('admin/events_edit', {event: event, tickets: data[1]});
	}).catch(function (err) {
		next(err);
	});
});

/* POST an update to an event */
router.post('/:event_id/edit', upload.single('image'), function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var timestamp = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var ticket_ids = (!req.body.tickets) ? [] : [].concat(req.body.tickets);

	Event.findById(parseInt(req.params.event_id)).then(function(event) {
		return Promise.all([
			event,
			event.setTickets(ticket_ids)
		])
	}).then(function(data) {
		event = data[0]
		if (req.file) {
			var image_name = event.name+shortid.generate()+'.'+mime.extension(req.file.mimetype);
			mv(req.file.path, __dirname+'/../../public/images/events/'+image_name, function (err) {
				if (err) throw err;
				return event.update(req.body.name, req.body.description, timestamp, image_name);
			});
		} else {
			return event.update(req.body.name, req.body.description, timestamp, null);
		}
	}).then(function () {
		res.redirect('/admin/events/'+req.params.event_id+'/edit?success')
	}).catch(function (err) {
		return next(err);
	});
});

/* GET a delete events event */
router.get('/:event_id/delete', function (req, res, next) {
	Event.findById(req.params.event_id).then(function (event) {
		return event.delete();
	}).then(function(){
		res.redirect('/admin/events');
	}).catch(function (err) {
		next(err);
	});
});

router.post('/tableplanner', upload.single('bookings'), function(req, res, next) {
	if (!req.file) return next(httpError(400, "No file uploaded"));
	fs.readFile(req.file.path, 'utf8', function(err, data) {
		if (err) return next(err);
		csv.parse(data, {columns:["booked_by","name","details"]}, function(err, data) {
			if (err) return next(err);
			data.sort(compare);
			group = 0;
			for (var i = 0; i < data.length; i++) {
				if (i==0 || data[i].booked_by != data[i-1].booked_by) group++;
				data[i].group = group;
			}
			res.render('admin/events_tableplanner', {no_tables: req.body.no_tables, no_seats: req.body.no_seats, bookings:data});
		});
	});

	function compare(a,b) {
	  if (a.booked_by < b.booked_by)
	    return -1;
	  if (a.booked_by > b.booked_by)
	    return 1;
	  return 0;
	}
});

module.exports = router;
