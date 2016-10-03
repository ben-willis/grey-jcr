var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET room page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT id, name FROM rooms ORDER BY name DESC')
		.then(function (rooms) {
			res.render('admin/rooms', {rooms: rooms});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new room */
router.post('/', function (req, res, next) {
	req.db.none('INSERT INTO rooms(name) VALUES ($1)',[req.body.name])
		.then(function (){
			res.redirect(303, '/admin/rooms')
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new name for a room */
router.post('/:roomid', function (req, res, next) {
	req.db.none('UPDATE rooms SET name=$1 WHERE id=$2',[req.body.name, req.params.roomid])
		.then(function (){
			res.redirect(303, '/admin/rooms')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET a delete a room */
router.get('/:roomid/delete', function (req, res, next) {
	req.db.none('DELETE FROM rooms WHERE id=$1',[req.params.roomid])
		.then(function (){
			res.redirect(303, '/admin/rooms')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET room bookings page */
router.get('/:roomid/bookings', function (req, res, next) {
	var room;
	req.db.one('SELECT id, name FROM rooms WHERE id=$1', [req.params.roomid])
		.then(function (data){
			room = data;
			return req.db.manyOrNone('SELECT id, name, start, duration, status FROM room_bookings WHERE roomid=$1 AND (start>NOW() OR status=0) ORDER BY start ASC', [req.params.roomid])
		})
		.then(function (bookings) {
			pending_bookings = [];
			upcoming_bookings = [];
			for (var i = 0; i < bookings.length; i++) {
				if (bookings[i].status == 0) {
					pending_bookings.push(bookings[i]);
				} else {
					upcoming_bookings.push(bookings[i]);
				}
			};
			res.render('admin/room_bookings', {room: room, pending_bookings: pending_bookings, upcoming_bookings: upcoming_bookings});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new booking */
router.post('/:roomid/bookings', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.start).split(':');
	var start = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var duration = parseInt(req.body.end) - (60*parseInt(time[0])+parseInt(time[1]));
	req.db.one('INSERT INTO room_bookings(name, start, duration, roomid, username, status) VALUES ($1, $2, $3, $4, $5, 1) RETURNING start', [req.body.name, start.toLocaleString(), duration, req.params.roomid, req.user.username])
		.then(function (book) {
			res.redirect(303, '/admin/rooms/'+req.params.roomid+'/bookings')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET an accept a booking */
router.get('/:roomid/bookings/:bookingid/accept', function (req, res, next) {
	req.db.none("UPDATE room_bookings SET status=1 WHERE id=$1", req.params.bookingid)
		.then(function () {
			res.redirect(303, '/admin/rooms/'+req.params.roomid+'/bookings?accept_success');
		})
		.catch(function (err) {
			next(err);
		})
})

/* GET a delete booking */
router.get('/:roomid/bookings/:bookingid/delete', function (req, res, next) {
	req.db.none("DELETE FROM room_bookings WHERE id=$1", req.params.bookingid)
		.then(function () {
			res.redirect(303, '/admin/rooms/'+req.params.roomid+'/bookings?delete_success');
		})
		.catch(function (err) {
			next(err);
		})
})

module.exports = router;
