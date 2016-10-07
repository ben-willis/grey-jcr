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

var Event = require('../../models/event');
var Ticket = require('../../models/ticket');

/* GET events page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Event.getFutureEvents(),
		Event.getPastEvents()
	]).then(function (data) {
		res.render('admin/events', {future_events: data[0], past_events: data[1]});
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
		res.redirect('/admin/events/'+event.id+'/edit')
	}).catch(function (err) {
		next(err);
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
		event.tickets = data[0]
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

	Event.findById(parseInt(req.params.event_id)).then(function(event) {
		return Promise.all([
			event,
			event.setTickets([].concat(req.body.tickets))
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
	})
});

module.exports = router;
