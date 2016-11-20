var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');

var Room = require('../../models/room');

router.use(function (req, res, next) {
	if (req.user.level < 4) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET room page. */
router.get('/', function (req, res, next) {
	Room.getAll().then(function(rooms){
		res.render('admin/rooms', {rooms: rooms});
	}).catch(next);
});

/* POST a new room */
router.post('/', function (req, res, next) {
	Room.create(req.body.name, req.body.description).then(function () {
		res.redirect(303, '/admin/rooms');
	}).catch(next);
});

/* GET room edit page */
router.get('/:room_id', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		res.render('admin/rooms_edit', {room: room})
	}).catch(next);
});

/* POST a new name for a room */
router.post('/:room_id', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		return room.update(req.body.name, req.body.description);
	}).then(function () {
		res.redirect(303, '/admin/rooms');
	}).catch(next);
});

/* GET a delete a room */
router.get('/:room_id/delete', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		return room.delete();
	}).then(function () {
		res.redirect(303, '/admin/rooms');
	}).catch(next);
});

/* GET room bookings page */
router.get('/:room_id/bookings', function (req, res, next) {
	var room;
	Room.findById(req.params.room_id).then(function(room) {
		return Promise.all([
			room,
			room.getFutureBookings(0),
			room.getFutureBookings(1),
			room.getFutureBookings(2)
		])
	}).then(function(data) {
		res.render('admin/room_bookings', {room: data[0], pending_bookings: data[1], accepted_bookings: data[2],  rejected_bookings: data[3]})
	}).catch(next);
});

/* POST a new room booking */
router.post('/:room_id/bookings', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.start).split(':');
	var start = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var duration = parseInt(req.body.end) - (60*parseInt(time[0])+parseInt(time[1]));
	if (duration <= 0) return next(httpError(400, "Start time must be before end time"))

	Room.findById(req.params.room_id).then(function(room) {
		return room.addBooking(req.body.name, start, duration, req.user.username, 1)
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

/* GET a accept a room booking */
router.get('/:room_id/bookings/:booking_id/accept', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		return room.updateBooking(req.params.booking_id, 1);
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

/* GET a reject a room booking */
router.get('/:room_id/bookings/:booking_id/reject', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		return room.updateBooking(req.params.booking_id, 2);
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

/* GET a revert a room booking */
router.get('/:room_id/bookings/:booking_id/revert', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		return room.updateBooking(req.params.booking_id, 0);
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

module.exports = router;
