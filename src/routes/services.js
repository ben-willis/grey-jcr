var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var httpError = require('http-errors');

var Feedback = require('../models/feedback');
var User = require('../models/user');
var Election = require('../models/election');
var Room = require('../models/room');

import DebtsService from "../debts/DebtsService";
import { getConnection } from "typeorm";
import UserServiceImpl from 'src/users/UserServiceImpl';

const debtsService = new DebtsService(getConnection("grey"));

/* GET room booking page */
router.get('/rooms/', function (req, res, next) {
	var week_offset = (req.query.week_offset) ? req.query.week_offset : 0;

	var current_date = new Date();
	var selected_date = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate() + 7*week_offset);

	var week_dates = [0,1,2,3,4,5,6].map(function(dow) {
		return new Date(selected_date.getTime() + ((dow - selected_date.getDay())*24*60*60*1000))
	});

	var room = null;
	Room.getAll().then(function(rooms) {
		if (req.user) {
			return Promise.all(
				rooms.map(function(room){
					return Promise.all(
						week_dates.map(function(date){
							return room.getBookings(1, date);
						})
					).then(function(bookings) {
						room.bookings = bookings;
						return Promise.all([
							room,
							room.getUserBookings(req.user.username)
						]);
					}).then(function(data){
						room = data[0];
						room.user_bookings = data[1];
						return room;
					});
				})
			);
		} else {
			return Promise.all(
				rooms.map(function(room){
					return Promise.all(
						week_dates.map(function(date){
							return room.getBookings(1, date);
						})
					).then(function(bookings) {
						room.bookings = bookings;
						return room;
					});
				})
			);
		}
	}).then(function(rooms) {
		res.render('services/rooms', {rooms: rooms, week_start: week_dates[0]});
	}).catch(next);
});

router.use(function (req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.session.redirect_to = req.originalUrl;
		res.redirect(401, '/login?unauthorised');
	}
});

/* POST a new booking */
router.post('/rooms/:room_id/bookings', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.start).split(':');
	var start = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var duration = parseInt(req.body.end) - (60*parseInt(time[0])+parseInt(time[1]));
	if (duration <= 0) return next(httpError(400, "Start time must be before end time"));

	Room.findById(req.params.room_id).then(function(room) {
		return room.addBooking(req.body.name, start, duration, req.user.username, 0);
	}).then(function () {
		res.redirect(303, '/services/rooms#'+req.params.room_id);
	}).catch(next);
});

/* GET a delete booking */
router.get('/rooms/:room_id/bookings/:booking_id/delete', function (req, res, next) {
	Room.findById(req.params.room_id).then(function(room) {
		return room.removeBooking(req.params.booking_id, req.user.username);
	}).then(function () {
		res.redirect(303, '/services/rooms#'+req.params.room_id);
	}).catch(next);
});

/* GET user page. */
router.get('/user/:username', function (req, res, next) {
	User.findByUsername(req.params.username).then(function (user) {
			res.render('services/profile', {currUser: user});
		}).catch(function (err) {
			next(err);
		});
});

/* GET update user page. */
router.get('/user/:username/update', function (req, res, next) {
	if (req.params.username != req.user.username) {
		var err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	}
	res.render('services/profile_edit');
});

/* POST a new avatar */
router.post('/user/:username/update', upload.single('avatar'), function (req, res, next) {
	if (req.params.username != req.user.username) {
		var err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	}

	const userService = new UserServiceImpl();
	userService.updateAvatar(req.user.username, req.file).then(newAvatarPath => {
		res.redirect(303, '/services/user/'+req.params.username+'?success');
	});
});

/* GET feedback page */
router.get('/feedback', function (req, res, next) {
	Feedback.getAllByUser(req.user.username).then(function(feedbacks) {
		return Promise.all(
			feedbacks.map(function(feedback) {
				return feedback.getReplies().then(function(replies) {
					feedback.replies = replies;
					return feedback;
				});
			})
		);
	}).then(function(feedbacks){
		res.render('services/feedback', {feedbacks: feedbacks});
	}).catch(function (err) {
		next(err);
	});
});

/* POST a new piece of feedback */
router.post('/feedback', function (req, res, next) {
	Feedback.create(req.body.title, req.body.message, (req.body.anonymous=='on'), req.user.username).then(function (feedback) {
			res.redirect(303, '/services/feedback/'+feedback.id+'?success');
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET an individual feedback */
router.get('/feedback/:feedback_id', function (req, res, next) {
	Feedback.findById(parseInt(req.params.feedback_id)).then(function(feedback) {
		if (feedback.author != req.user.username) throw httpError(403);
		return Promise.all([
			feedback,
			feedback.getReplies().then(function(replies) {
				return Promise.all(
					replies.map(function(reply) {
						return User.findByUsername(reply.author).then(function(user) {
							reply.author = (!feedback.anonymous || reply.exec) ? user : null;
							return reply;
						});
					})
				);
			}),
			User.findByUsername(feedback.author).then(function(user) {
				return (feedback.anonymous) ? null: user;
			}),
			feedback.setReadByUser()
		]);
	}).then(function (data) {
		data[0].author = data[2];
		return res.render('services/feedback_view', {feedback: data[0], replies: data[1]});
	}).catch(function (err) {
		return next(err);
	});
});

/* POST a reply */
router.post('/feedback/:feedback_id', function (req, res, next) {
	Feedback.findById(parseInt(req.params.feedback_id)).then(function(feedback) {
		if (feedback.author != req.user.username) throw httpError(403);
		return feedback.addReply(req.body.message, false, req.user.username);
	}).then(function () {
		res.redirect(303, '/services/feedback/'+req.params.feedback_id+'?success');
	}).catch(function (err) {
		next(err);
	});
});

/* GET the election page */
router.get('/elections', function (req, res, next) {
		Promise.all([
			Election.getByStatus(2),
			Election.getByStatus(1)
		]).then(function(data){
			res.render('services/elections', {open: data[0], publicizing: data[1]});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET the vote in elections page */
router.get('/elections/:election_id', function (req, res, next) {
	var vote;
	var election;
	req.user.getVote(parseInt(req.params.election_id)).then(function(data){
		vote = data;
		return Election.findById(parseInt(req.params.election_id));
	}).then(function (election) {
			res.render('services/elections_vote', {election: election, user_vote: vote});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a vote */
router.post('/elections/:election_id', function (req, res, next) {
	req.user.getVote(parseInt(req.params.election_id))
		.then(function(vote) {
			if (vote) {
				throw httpError(400, "You have already voted in this election");
			}
			return Election.findById(parseInt(req.params.election_id));
		})
		.then(function(election){
			return Promise.all(
				req.body.ballot.map(function(ballot){
					election.castVote(req.user.username, ballot.position_id, ballot.votes);
				})
			);

		})
		.then(function () {
			res.redirect(303, '/services/elections/'+req.params.election_id+'?success');
		})
		.catch( function (err) {
			next(err);
		});
});

/* GET the debts page */
router.get('/debt', function (req, res, next) {
	debtsService.getDebts(req.user.username).then((debts) => {
		const total_debt = debts.reduce((a, b) => a + b.amount, 0);
		res.render('services/debt', {debts, total_debt});
	}).catch(next);
});

/* GET the cancel page */
router.get('/debt/pay/cancel', function (req, res, next) {
	res.render('services/debt_cancel');
});

module.exports = router;
