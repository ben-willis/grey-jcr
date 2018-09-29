var express = require('express');
var router = express.Router();
var validator = require('validator');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../../tmp'});
var mv = require('mv');
var mime = require('mime');
var csv = require('csv');
var slugify = require('slug');
var shortid = require('shortid');
var fs = require('fs');
var httpError = require('http-errors');

const Op = require("sequelize").Op;

var io = require('../../helpers/socketApi.js').io;

var models = require("../../models");


/* GET events page. */
router.get('/', function (req, res, next) {
	Promise.all([
		models.event.findAll({where: {time: {[Op.gte]: new Date()}}}),
		models.event.findAll({where: {time: {[Op.lt]: new Date()}}}),
		models.valentines_status.findOne().then(function(valentinesStatus) {return valentinesStatus.status;})
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
	var timestamp = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	models.event.create({
		name: req.body.name,
		slug: slugify(req.body.name),
		description: req.body.description,
		time: timestamp
	}).then(function (event){
		res.redirect('/admin/events/'+event.id+'/edit');
	}).catch(next);
});

router.post('/valentines/pairs', upload.single('pairs'), function(req, res, next) {
	if (!req.file) return next(httpError(400, "No file uploaded"));
	fs.readFile(req.file.path, 'utf8', function(err, data) {
		if (err) return next(err);
		csv.parse(data, function(err, data) {
			if (err) return next(err);
			Promise.all([
				models.valentines_pair.destroy(),
				models.valentines_swap.destroy()
			]).then(function() {
				return Promise.all(
					data.map(function(row, index){
						if (row.length != 2) return httpError(400, "CSV should have two columns");
						return models.valentines_pair.create({
							leader: row[0],
							partner: row[1],
							position: index
						});
					})
				);
			}).then(function(){
				res.redirect(303, '/admin/events');
			}).catch(next);
		});
	});
});

router.get('/valentines/open', function(req, res, next) {
	models.valentines_status.findOne().then(function(valentinesStatus) {
		return valentinesStatus.update({status: true});
	}).then(function() {
		res.redirect('/admin/events');
	}).catch(next);
});

router.get('/valentines/close', function(req, res, next) {
	models.valentines_status.findOne().then(function(valentinesStatus) {
		return valentinesStatus.update({status: false});
	}).then(function() {
		io.emit('close_swapping');
		res.redirect('/admin/events');
	}).catch(next);
});

router.get('/valentines/debts', function(req, res, next) {
	models.valentines_swap.findAll().then(function(swaps) {
		var debts = {};
		swaps.forEach((swap) => {
			if (swap.username === null) return;
			if (debts[swap.username] === undefined) {
				debts[swap.username] = 0;
			}
			debts[swap.username] += swap.cost;
		});
		return Promise.all(debts.map((username, debt) => {
			return models.debt.create({
				name: "Valentines Swapping",
				amount: debt,
				username: username
			});
		}));
	}).then(function(){
		return models.valentines_swap.findAll();
	}).then(function(swaps) {
		return Promise.all(swaps.map((swap) => swap.update({username: null})));
	}).then(function(){
		res.redirect('/admin/events');
	}).catch(next);
});

/* GET edit events page. */
router.get('/:event_id/edit', function (req, res, next) {
	Promise.all([
		models.event.findById(req.params.event_id, {include: [models.ticket]}),
		models.ticket.findAll()
	]).then(function ([event, tickets]) {
		event.tickets = event.tickets.map(x => x.id);
		res.render('admin/events_edit', {event: event, tickets: tickets});
	}).catch(next);
});

/* POST an update to an event */
router.post('/:event_id/edit', upload.single('image'), function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.time).split(':');
	var timestamp = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var ticket_ids = (!req.body.tickets) ? [] : [].concat(req.body.tickets);

	var imagePromise = new Promise(function(resolve, reject) {
		if (req.file) {
			const imageName = event.name+shortid.generate()+'.'+mime.extension(req.file.mimetype);
			mv(req.file.path, __dirname+'/../../public/files/events/'+imageName, function (err) {
				if (err)  reject(err);
				else resolve(imageName);
			});
		} else resolve(null);
	});

	Promise.all([
		models.event.findById(req.params.event_id),
		Promise.all(ticket_ids.map((id) => models.ticket.findById(id))),
		imagePromise
	]).then(function([event, tickets, imageName]){
		return Promise.all([
			event.addTickets(tickets),
			event.update({
				name: req.body.name,
				slug: slugify(req.body.name),
				description: req.body.description,
				time: timestamp,
				image: imageName || event.image
			})
		]);
	}).then(function () {
		res.redirect('/admin/events/'+req.params.event_id+'/edit?success');
	}).catch(next);
});

/* GET a delete events event */
router.get('/:event_id/delete', function (req, res, next) {
	models.event.findById(req.params.event_id).then(function (event) {
		return event.destroy();
	}).then(function(){
		res.redirect('/admin/events');
	}).catch(next);
});

router.post('/tableplanner', upload.single('bookings'), function(req, res, next) {
	if (!req.file) return next(httpError(400, "No file uploaded"));
	fs.readFile(req.file.path, 'utf8', function(err, data) {
		if (err) return next(err);
		csv.parse(data, {columns:["booked_by","name","details"]}, function(err, data) {
			if (err) return next(err);
			data.sort(compare);
			var group = 0;
			for (var i = 0; i < data.length; i++) {
				if (i === 0 || data[i].booked_by != data[i-1].booked_by) group++;
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
