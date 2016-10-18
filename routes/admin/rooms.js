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
	Room.findById(req.params.room_id).then(function(data) {
		room = data;
		return room.getFutureBookings();
	}).then(function(bookings) {
		room.bookings = bookings;
		res.render('admin/room_bookings', {room: room})
	}).catch(next);
});

/* POST a new booking */
router.post('/:room_id/bookings', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.start).split(':');
	var start = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var duration = parseInt(req.body.end) - (60*parseInt(time[0])+parseInt(time[1]));

	Room.findById(req.params.room_id).then(function(room) {
		return room.addBooking(req.body.name, start, duration, req.body.notes)
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
});

/* GET a delete booking */
router.get('/:room_id/bookings/:booking_id/delete', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		return room.removeBooking(req.params.booking_id)
	}).then(function () {
		res.redirect(303, '/admin/rooms/'+req.params.room_id+'/bookings');
	}).catch(next);
})

module.exports = router;
