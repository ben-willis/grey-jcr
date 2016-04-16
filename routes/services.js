var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../tmp'});
var mv = require('mv');
var mime = require('mime');
var treeize   = require('treeize');
var paypal = require('paypal-rest-sdk');

require('dotenv').config();

router.use(function (req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.session.redirect_to = req.originalUrl;
		res.redirect(401, '/login?unauthorised');
	}
});

/* GET room booking page */
router.get('/rooms/', function (req, res, next) {
	var year = (req.query && req.query.year) ? parseInt(req.query.year) : (new Date()).getFullYear()
	// Get the date of the first day of the week
	var curr = new Date();
	var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
	var date = (req.query && req.query.date) ? parseInt(req.query.date) : Math.floor((firstday -  new Date(year, 0, 0))/86400000);
	// Calculate its date number
	req.db.manyOrNone('SELECT rooms.id, rooms.name, room_bookings.name AS "bookings:name", room_bookings.status AS "bookings:status", room_bookings.start AS "bookings:start", EXTRACT(dow FROM room_bookings.start) AS "bookings:dow", (2*EXTRACT(hour FROM room_bookings.start) + EXTRACT(minute FROM room_bookings.start)/30) AS "bookings:slot", room_bookings.duration/30 AS "bookings:duration" FROM rooms LEFT JOIN room_bookings ON rooms.id=room_bookings.roomid WHERE (room_bookings.status=1 OR room_bookings.username=$1) ORDER BY EXTRACT(dow FROM room_bookings.start) ASC, (2*EXTRACT(hour FROM room_bookings.start) + EXTRACT(minute FROM room_bookings.start)/30) ASC', [req.user.username])
		.then(function(data) {
			for (var i = data.length - 1; i >= 0; i--) {
				start = new Date(data[i]["bookings:start"]);
				if (start < new Date(year, 0, date) || start > new Date(year, 0, date+7)) {
					delete data[i]["bookings:name"]
					delete data[i]["bookings:start"]
					delete data[i]["bookings:dow"]
					delete data[i]["bookings:slot"]
					delete data[i]["bookings:duration"]
					delete data[i]["bookings:status"]
				}
			};
			var roomTree = new treeize();
			roomTree.grow(data);
			rooms = roomTree.getData();
			res.render('services/rooms', {rooms: rooms, year: year, date: date});
		}).catch(function (err) {
			next(err);
		});
});

/* POST a room booking */
router.post('/rooms/:roomid/', function (req, res, next) {
	var date = (req.body.date).split('-');
	var time = (req.body.start).split(':');
	var start = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
	var duration = parseInt(req.body.end) - (60*parseInt(time[0])+parseInt(time[1]));
	req.db.one('INSERT INTO room_bookings(name, start, duration, roomid, username, status) VALUES ($1, $2, $3, $4, $5, 0) RETURNING start', [req.body.name, start.toLocaleString(), duration, req.params.roomid, req.user.username])
		.then(function (book) {
			res.redirect(303, '/services/rooms/?success#'+req.params.roomid)
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET user page. */
router.get('/user/:username', function (req, res, next) {
	req.db.one("SELECT name, email, username FROM users WHERE username=$1", [req.params.username])
		.then(function (user) {
			res.render('services/profile', {currUser: user});
		}).catch(function (err) {
			next(err);
		});
});

/* GET update user page. */
router.get('/user/:username/update', function (req, res, next) {
	if (req.params.username != req.user.username) {
		err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	}
	res.render('services/profile_edit');
});

/* POST a new avatar */
router.post('/user/:username/update', upload.single('avatar'), function (req, res, next) {
	if (req.params.username != req.user.username) {
		err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	}
	mv(req.file.path, __dirname+'/../public/images/avatars/'+req.params.username+'.png', function (err) {
		if (err) return next(err);
		res.redirect(303, '/services/user/'+req.params.username+'?success');
	});
});

/* GET feedback page */
router.get('/feedback', function (req, res, next) {
	req.db.manyOrNone('SELECT feedback.id, feedback.title, (SELECT COUNT(*) FROM feedback AS replies WHERE replies.parentid=feedback.id) AS no_replies, feedback.timestamp FROM feedback LEFT JOIN users ON feedback.author=users.username WHERE author=$1 AND parentid IS NULL AND exec=false ORDER BY timestamp DESC', req.user.username)
		.then(function (feedback) {
			res.render('services/feedback', {feedback: feedback});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new piece of feedback */
router.post('/feedback', function (req, res, next) {
	req.db.one('INSERT INTO feedback(title, message, author, exec, anonymous) VALUES ($1, $2, $3, $4, $5) RETURNING id', [req.body.title, req.body.message, req.user.username, false, (req.body.anonymous=='on')])
		.then(function (feedback) {
			res.redirect(303, '/services/feedback/'+feedback.id+'?success')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET an individual feedback */
router.get('/feedback/:feedbackid', function (req, res, next) {
	req.db.many('SELECT feedback.id, feedback.title, feedback.message, feedback.timestamp, users.name, feedback.author, feedback.exec, feedback.anonymous FROM feedback LEFT JOIN users ON feedback.author=users.username WHERE (author=$1 AND id=$2) OR parentid=$2 ORDER BY timestamp ASC', [req.user.username, req.params.feedbackid])
		.then(function (feedback) {
			res.render('services/feedback_view', {feedback: feedback});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a reply */
router.post('/feedback/:feedbackid', function (req, res, next) {
	req.db.none('INSERT INTO feedback(title, message, author, exec, parentid) VALUES ($1, $2, $3, $4, $5)', ['reply', req.body.message, req.user.username, false, req.params.feedbackid])
		.then(function () {
			res.redirect(303, '/services/feedback/'+req.params.feedbackid+'?success')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET the election page */
router.get('/elections', function (req, res, next) {
	req.db.manyOrNone('SELECT (SELECT COUNT(*)>0 FROM election_votes AS votes WHERE votes.electionid=elections.id AND votes.username=$1) AS voted, elections.id, elections.title, elections.status, election_positions.id AS "positions:id", election_positions.name AS "positions:name", election_nominations.name AS "positions:nominations:name", election_nominations.manifesto AS "positions:nominations:manifesto" FROM elections FULL JOIN election_positions ON elections.id=election_positions.electionid FULL JOIN election_nominations ON election_positions.id=election_nominations.positionid WHERE (elections.status=1 OR elections.status=2) AND election_positions.electionid IS NOT NULL AND election_nominations.electionid IS NOT NULL AND election_positions.id IS NOT NULL ORDER BY elections.status DESC, elections.id ASC, election_positions.id ASC', [req.user.username])
		.then(function (elections) {
			var electionTree = new treeize();
			electionTree.grow(elections);
			elections = electionTree.getData();
			var open = [];
			var publicizing = [];
			for (var i = 0; i < elections.length; i++) {
				if (elections[i].status == 2) {
					open.push(elections[i]);
				} else {
					publicizing.push(elections[i]);
				}
			};
			res.render('services/elections', {open: open, publicizing: publicizing});
		})
		.catch(function (err) {
			next(err);
		})
});

/* GET the vote in elections page */
router.get('/elections/:electionid', function (req, res, next) {
	var voted = false;
	var election;
	req.db.one('SELECT id, title, status FROM elections WHERE elections.id=$1', [req.params.electionid])
		.then(function (data) {
			// If the election isn't open throw an error
			if (data.status != 2) {
				err = new Error('Election is not open for voting');
				err.status=400;
				throw err;
			}
			election = data;
			// If it is work out if they've voted
			return req.db.one('SELECT COUNT(id) FROM election_votes WHERE username=$1 AND electionid=$2', [req.user.username, req.params.electionid])
		})
		.then(function (voteCount) {
			if (voteCount.count == 0) {
				return req.db.many('SELECT election_nominations.name AS "positions:nominations:name", election_nominations.id AS "positions:nominations:id", election_positions.name as "positions:name", election_positions.id AS "positions:id" FROM election_nominations LEFT JOIN election_positions ON election_positions.id=election_nominations.positionid WHERE election_nominations.electionid=$1 ORDER BY election_positions.id', [req.params.electionid]);
			} else {
				voted = true;
				return req.db.many('SELECT election_nominations.name AS "positions:nominations:name", election_nominations.id AS "positions:nominations:id", election_positions.name as "positions:name", election_positions.id AS "positions:id", election_votes.value AS "positions:nominations:value" FROM election_nominations LEFT JOIN election_positions ON election_positions.id=election_nominations.positionid LEFT JOIN election_votes ON election_votes.nominationid=election_nominations.id WHERE election_nominations.electionid=$1 AND election_votes.username=$2 ORDER BY election_positions.id', [req.params.electionid, req.user.username]);
			}
		})
		// And send them the details on who's running
		.then(function (nominations) {
			var positionsTree = new treeize();
			positionsTree.grow(nominations);
			election.positions = positionsTree.getData();
			res.render('services/elections_vote', {election: election, voted: voted});
		})
		.catch(function (err) {
			next(err);
		})
});

/* POST a vote */
router.post('/elections/:electionid', function (req, res, next) {
	// Check whether they've voted
	req.db.one('SELECT COUNT(id) FROM election_votes WHERE username=$1 AND electionid=$2', [req.user.username, req.params.electionid])
		.then(function (voteCount) {
			if (voteCount.count != 0) {
				err = new Error("You have already voted in this election");
				err.status(400);
				throw err;
			}
			var query = "INSERT INTO election_votes(username, electionid, nominationid, value) VALUES ";
			for (candidate in req.body.candidates) {
				currentCandidate = candidate.slice(1);
				if (!isNaN(currentCandidate) ) {
					value = "($1, $2,";
					value += currentCandidate + ', ';
					if (!isNaN(req.body.candidates[candidate]) && req.body.candidates[candidate] != 0) {
						value += req.body.candidates[candidate];
					} else {
						value += 0;
					}
					value += "),";
					query += value;
				}
			}
			query = query.slice(0, -1);
			return req.db.none(query, [req.user.username, req.params.electionid]);
		})
		.then(function () {
			res.redirect(303, '/services/elections/'+req.params.electionid+'?success');
		})
		.catch( function (err) {
			next(err);
		})
});

// Configure Paypal
paypal.configure({
	'mode': process.env.PAYPAL_MODE,
	'client_id': process.env.PAYPAL_CLIENT_ID,
	'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

/* GET the debts page */
router.get('/debt', function (req, res, next) {
	req.db.manyOrNone('SELECT name, message, amount, (SELECT SUM(amount) FROM debts WHERE username=$1) AS total FROM debts WHERE username=$1 ORDER by timestamp DESC',[req.user.username])
		.then(function (debts) {
			res.render('services/debt', {debts: debts});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET pay a debt */
router.get('/debt/pay', function (req, res, next){
	var host = req.get('host');
	req.db.one('SELECT SUM(amount) AS amount FROM debts WHERE username=$1 LIMIT 1', [req.user.username])
		.then(function (debt) {
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
			  			"total": (debt.amount/100).toFixed(2),
			  			"currency": "GBP"
					},
					"description": "Clear Debt to Grey JCR",
					"item_list": {
						"items": [
							{
								"quantity": "1",
								"name": "Clear Debt",
								"price": (debt.amount/100).toFixed(2),
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
		})
		.catch(function (err) {
			next(err);
		})
})

/* GET the confirmation page */
router.get('/debt/pay/confirm', function (req, res, next) {
	res.render('services/debt_confirm', {"payerId": req.query.PayerID});
});

/* GET execute the payment */
router.get('/debt/pay/execute', function (req, res, next) {
	var paymentId = req.session.paymentId;
  	var PayerID = req.query.PayerID;

	paypal.payment.execute(paymentId, { 'payer_id': PayerID }, function (err, payment) {
	    if (err) return next(err);
	    var amount = (-1)*Math.floor(parseFloat(payment.transactions[0].amount.total)*100);
	   	var paymentid = payment.transactions[0].related_resources[0].sale.id;
	   	delete req.session.paymentId;
	    req.db.none('INSERT INTO debts (name, message, amount, username) VALUES ($1, $2, $3, $4)', ['PayPal Payment', 'Payment ID: '+paymentid, amount, req.user.username])
	    	.then(function(){
	    		res.redirect(303, '/services/debt');
	    	})
	    	.catch(function (err) {
	    		next(err);
	    	})
  	});
});


/* GET the cancel page */
router.get('/debt/pay/cancel', function (req, res, next) {
	res.render('services/debt_cancel', {"payerId": req.query.PayerID});
});

module.exports = router;
