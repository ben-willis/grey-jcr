var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var paypal = require('paypal-rest-sdk');
var httpError = require('http-errors');
var shortid = require('shortid');

const Op = require("sequelize").Op;

var models = require('../models');

/* GET room booking page */
router.get('/rooms/', function (req, res, next) {
	var week_offset = (req.query.week_offset) ? req.query.week_offset : 0;

	var current_date = new Date();
	var selected_date = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate() + 7*week_offset);

	var week_dates = [0,1,2,3,4,5,6].map(function(dow) {
		return new Date(selected_date.getTime() + ((dow - selected_date.getDay())*24*60*60*1000));
	});

	var roomsPromise = models.room.findAll({
			include: [{
				model: models.room_booking,
				as: "bookings",
				where: {
					status: 1,
					start_time: {
						[Op.between]: [
							new Date(selected_date.getTime() + ((0 - selected_date.getDay())*24*60*60*1000)),
							new Date(selected_date.getTime() + ((6 - selected_date.getDay())*24*60*60*1000))
						]
					}
				}
			}]
	});

	var userBookingsPromise = models.room_booking.findAll({
		where: {
			start_time: {
				[Op.gt]: new Date()
			},
			username: req.user.username
		}
	});

	Promise.all([roomsPromise, userBookingsPromise]).then(function([rooms, userBookings]) {
		res.render('services/rooms', {rooms: rooms, user_bookings: userBookings, week_start: week_dates[0]});
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

	models.room.findById(req.params.room_id).then(function(room) {
		return room.createBooking({
			name: req.body.name,
			start_time: start,
			duration: duration,
			username: req.user.username,
			status: 0
		});
	}).then(function() {
		res.redirect(303, '/services/rooms#'+req.params.room_id);
	}).catch(next);
});

/* GET a delete booking */
router.get('/rooms/:room_id/bookings/:booking_id/delete', function (req, res, next) {
	models.room_Booking.findById(req.params.booking_id).then(function(booking) {
		return booking.destroy();
	}).then(function () {
		res.redirect(303, '/services/rooms#'+req.params.room_id);
	}).catch(next);
});

/* GET user page. */
router.get('/user/:username', function (req, res, next) {
	models.user.findById(req.params.username).then(function (user) {
		res.render('services/profile', {currUser: user});
	}).catch(next);
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
	mv(req.file.path, __dirname+'/../public/files/avatars/'+req.params.username+'.png', function (err) {
		if (err) return next(err);
		res.redirect(303, '/services/user/'+req.params.username+'?success');
	});
});

/* GET feedback page */
router.get('/feedback', function (req, res, next) {
  models.feedback.findAll({
    where: {author_username: req.user.username, parent_id: null},
    include: [{
      model: models.feedback,
      as: "replies"
    }],
    order: [["updated", "DESC"]]
  }).then(function(feedbacks) {
    res.render("services/feedback", {feedbacks: feedbacks.map(x => x.toJSON())});
  }).catch(next);
});

/* POST a new piece of feedback */
router.post('/feedback', function (req, res, next) {
	models.feedback.create({
		title: req.body.title,
		message: req.body.message,
		anonymous: (req.body.anonymous == "on"),
		author_username: req.user.username,
		exec: false
	}).then(function(feedback) {
		res.redirect(303, '/services/feedback/'+feedback.id+'?success');
	}).catch(next);
});

/* GET an individual feedback */
router.get('/feedback/:feedback_id', function (req, res, next) {
	var feedbackPromise = models.feedback.findById(req.params.feedback_id, {
		include: [{
			model: models.feedback,
			as: "replies"
		}]
	}).then(function(feedback) {
		return feedback.update({read_by_user: true});
	});
	var authorPromise = feedbackPromise.then(function(feedback) {
		return models.user.findById(feedback.author_username);
	});

	Promise.all([feedbackPromise, authorPromise]).then(function([feedback, author]) {
		if (feedback.author_username != req.user.username) throw httpError(403);
		res.render('services/feedback_view', {feedback: feedback, author: author});
	}).catch(next);
});

/* POST a reply */
router.post('/feedback/:feedback_id', function (req, res, next) {
	models.feedback.findById(req.params.feedback_id).then(function(feedback) {
		if (feedback.author_username != req.user.username) throw httpError(403);
		return Promise.all([
			feedback.update({archived: false}),
			models.feedback.create({
				title: "reply",
				message: req.body.message,
				author: req.user.username,
				parent_id: feedback.id,
				read_by_user: true,
				exec: false
			})
		]);
	}).then(function ([feedback, reply]) {
		res.redirect(303, '/services/feedback/'+feedback.id+'?success');
	}).catch(next);
});

/* GET the election page */
router.get('/elections', function (req, res, next) {
		Promise.all([
			models.election.findAll({where: {status: 2}}),
			models.election.findAll({where: {status: 1}})
		]).then(function(data){
			res.render('services/elections', {open: data[0], publicizing: data[1]});
		}).catch(next);
});

/* GET the vote in elections page */
router.get('/elections/:election_id', function (req, res, next) {
	var votePromise = models.election_vote.findAll({
		where: {
			election_id: req.params.election_id,
			username: req.user.username
		}
	}).then(function(userVotes) {
		var userVote = {};
		for (const vote in userVotes) {
			userVote[vote.nominee_id] = vote.preference;
		}
		return userVote;
	});

	var electionPromise = models.election.findById(req.params.election_id);

	Promise.all([votePromise, electionPromise]).then(function ([vote, election]) {
		res.render('services/elections_vote', {election: election, user_vote: vote});
	}).catch(next);
});

/* POST a vote */
router.post('/elections/:election_id', function (req, res, next) {
	models.election_vote.findAll({
		where: {
			election_id: req.params.election_id,
			username: req.user.username
		}
	}).then(function(userVotes) {
			if (userVotes) {
				throw httpError(400, "You have already voted in this election");
			}
			return models.election.findById(req.params.election_id);
		}).then(function(election){
			var castVotePromises = req.body.ballot.map(function(ballot){
				var usercode = shortid.generate();
				Object.keys(ballot.votes).map(k => {
					var vote = ballot.votes[k];
					return models.election_vote.create({
						nominee_id: vote.nominee_id,
						position_id: ballot.position_id,
						election_id: election.id,
						preference: vote.preference,
						usercode: usercode,
						username: req.user.username
					});
				});
			});
			return Promise.all([].concat.apply([], castVotePromises));
		}).then(function () {
			res.redirect(303, '/services/elections/'+req.params.election_id+'?success');
		}).catch(next);
});

// Configure Paypal
paypal.configure({
	'mode': process.env.PAYPAL_MODE,
	'client_id': process.env.PAYPAL_CLIENT_ID,
	'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

/* GET the debts page */
router.get('/debt', function (req, res, next) {
	Promise.all([
		req.user.getDebt(),
		req.user.getDebts()
	]).then(function (data) {
		res.render('services/debt', {debts: data[1], total_debt: data[0]});
	}).catch(function (err) {
		next(err);
	});
});

/* GET pay a debt */
router.get('/debt/pay', function (req, res, next){
	var host = req.get('host');
	req.user.getDebt().then(function (debt) {
		var payment = {
			"intent": "sale",
			"payer": {
				"payment_method": "paypal"
			},
			"redirect_urls": {
				"return_url": "http://"+host+"/services/debt/pay/confirm",
				"cancel_url": "http://"+host+"/services/debt/pay/cancel"
			},
			"transactions": [{
				"amount": {
		  			"total": (debt/100).toFixed(2),
		  			"currency": "GBP"
				},
				"description": "Clear Debt to Grey JCR",
				"item_list": {
					"items": [
						{
							"quantity": "1",
							"name": "Clear Debt",
							"price": (debt/100).toFixed(2),
							"currency": "GBP"
						}
					]
				}
			}]
		};
		paypal.payment.create(payment, function (err, payment) {
			if (err) return next(err);
			req.session.paymentId = payment.id;
		    for(var i=0; i < payment.links.length; i++) {
				if (payment.links[i].method === 'REDIRECT') {
					return res.redirect(303, payment.links[i].href);
				}
			}
		});
	}).catch(next);
});

/* GET the confirmation page */
router.get('/debt/pay/confirm', function (req, res, next) {
	req.user.getDebt().then(function(debt) {
		res.render('services/debt_confirm', {"payerId": req.query.PayerID, debt_amount: debt});
	}).catch(next);
});

/* GET execute the payment */
router.get('/debt/pay/execute', function (req, res, next) {
	var paymentId = req.session.paymentId;
  	var PayerID = req.query.PayerID;

	paypal.payment.execute(paymentId, { 'payer_id': PayerID }, function (err, payment) {
	    if (err) return next(err);
	    var amount = Math.floor(parseFloat(payment.transactions[0].amount.total)*100);
	   	var paymentid = payment.transactions[0].related_resources[0].sale.id;
	   	delete req.session.paymentId;
		req.user.payDebt('PayPal Payment', 'Payment ID: '+paymentid, amount).then(function(){
	    	res.redirect(303, '/services/debt');
	    }).catch(function (err) {
	    	next(err);
	    });
  	});
});


/* GET the cancel page */
router.get('/debt/pay/cancel', function (req, res, next) {
	res.render('services/debt_cancel', {"payerId": req.query.PayerID});
});

module.exports = router;
