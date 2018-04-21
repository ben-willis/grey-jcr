var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');
var moment = require('moment');

var models = require('../../models');

router.use(function (req, res, next) {
	if (req.user.level < 4) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET room page. */
router.get('/', function (req, res, next) {
	models.room.findAll().then(function(rooms){
		res.render('admin/rooms', {rooms: rooms});
	}).catch(next);
});

/* POST a new room */
router.post('/', function (req, res, next) {
	models.room.create({
		name: req.body.name,
		description: req.body.description
	}).then(function (room) {
		res.redirect(303, '/admin/rooms');
	}).catch(next);
});

/* GET room edit page */
router.get('/:room_id', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		res.render('admin/rooms_edit', {room: room});
	}).catch(next);
});

/* POST a new name for a room */
router.post('/:room_id', function (req, res, next) {
	models.room.findById(req.params.room_id).then(function(room) {
		return room.update({
			name: req.body.name,
			description: req.body.description
		});
	}).then(function (room) {
		res.redirect(303, '/admin/rooms');
	}).catch(next);
});

/* GET a delete a room */
router.get('/:room_id/delete', function (req, res, next) {
	models.room.findById(req.params.room_id).then(function(room) {
		return room.destroy();
	}).then(function () {
		res.redirect(303, '/admin/rooms');
	}).catch(next);
});

/* GET room bookings page */
router.get('/:room_id/bookings', function (req, res, next) {
	var roomPromise = models.room.findById(req.params.room_id);
	var bookingsPromise = roomPromise.then(function(room) {
		return Promise.all([
			room.getBookings({where: {status: 0}}),
			room.getBookings({where: {status: 1}}),
			room.getBookings({where: {status: 2}})
		]);
	});

	Promise.all([roomPromise, bookingsPromise]).then(function([room, bookings]) {
		res.render('admin/room_bookings', {room: room, pending_bookings: bookings[0], accepted_bookings: bookings[1],  rejected_bookings: bookings[2]});
	}).catch(next);
});

/* POST a new room booking */
router.post('/:room_id/bookings', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.start).split(':');
	var start = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var duration = parseInt(req.body.end) - (60*parseInt(time[0])+parseInt(time[1]));
	if (duration <= 0) return next(httpError(400, "Start time must be before end time"));

	var repeats = req.body.repeats;
	var occurrences = (repeats === 0) ? 1 : req.body.occurrences;


	models.room.findById(req.params.room_id).then(function(room) {
		var booking_promises = [];
		for (var i = 0; i < occurrences; i++) {
			var startWrapper = moment(start);
			startWrapper.add(i*repeats, 'days');
			booking_promises.push(
				room.addBooking({
					name: req.body.name,
					start_time: startWrapper.toDate(),
					duration: duration,
					username: req.user.username,
					status: 1
				})
			);
		}
		return Promise.all(booking_promises);
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

/* GET a accept a room booking */
router.get('/:room_id/bookings/:booking_id/accept', function (req, res, next) {
	models.room_booking.findById(req.params.booking_id).then(function(booking) {
		return booking.update({status: 1});
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

router.get('/:room_id/bookings/:booking_id/reject', function (req, res, next) {
	models.room_booking.findById(req.params.booking_id).then(function(booking) {
		return booking.update({status: 2});
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

router.get('/:room_id/bookings/:booking_id/revert', function (req, res, next) {
	models.room_booking.findById(req.params.booking_id).then(function(booking) {
		return booking.update({status: 0});
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

module.exports = router;
