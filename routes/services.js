var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../tmp'});
var mv = require('mv');
var mime = require('mime');

router.use(function (req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.session.redirect_to = req.originalUrl;
		res.redirect(401, '/login?unauthorised');
	}
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
		res.redirect(303, '/services/user/'+req.params.username);
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
	req.db.none('INSERT INTO feedback(title, message, author, exec, anonymous) VALUES ($1, $2, $3, $4, $5)', [req.body.title, req.body.message, req.user.username, false, (req.body.anonymous=='on')])
		.then(function () {
			res.redirect(303, '/services/feedback')
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
			res.redirect(303, '/services/feedback/'+req.params.feedbackid)
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET the election page */
router.get('/elections', function (req, res, next) {
	req.db.manyOrNone('SELECT (SELECT COUNT(*)>0 FROM election_votes AS votes WHERE votes.electionid=elections.id AND votes.username=$1) AS voted, elections.id, elections.title, elections.status, election_positions.id AS position_id, election_positions.name AS position_name, election_nominations.name AS nomination_name, election_nominations.manifesto AS nomination_manifesto FROM elections FULL JOIN election_positions ON elections.id=election_positions.electionid FULL JOIN election_nominations ON election_positions.id=election_nominations.positionid WHERE (elections.status=1 OR elections.status=2) AND election_positions.electionid IS NOT NULL AND election_nominations.electionid IS NOT NULL AND election_positions.id IS NOT NULL ORDER BY elections.status DESC, elections.id ASC, election_positions.id ASC', [req.user.username])
		.then(function (nominations) {
			res.render('services/elections', {nominations: nominations});
		})
		.catch(function (err) {
			next(err);
		})
});

/* GET the vote in elections page */
router.get('/elections/:electionid', function (req, res, next) {
	req.db.one('SELECT id, title, status FROM elections WHERE elections.id=$1', [req.params.electionid])
		.then(function (election) {
			if (election.status != 2) {
				err = new Error('Election is not open for voting');
				err.status=400;
				next(err);
			} else {
				var voted = false;
				req.db.one('SELECT COUNT(id) FROM election_votes WHERE username=$1 AND electionid=$2', [req.user.username, req.params.electionid])
					.then(function (voteCount) {
						if (voteCount.count == 0) {
							return req.db.many('SELECT election_nominations.name, election_nominations.id, election_positions.name as position_name, election_positions.id AS position_id FROM election_nominations LEFT JOIN election_positions ON election_positions.id=election_nominations.positionid WHERE election_nominations.electionid=$1 ORDER BY election_positions.id', [req.params.electionid]);
						} else {
							voted = true;
							return req.db.many('SELECT election_nominations.name, election_nominations.id, election_positions.name as position_name, election_positions.id AS position_id, election_votes.value FROM election_nominations LEFT JOIN election_positions ON election_positions.id=election_nominations.positionid LEFT JOIN election_votes ON election_votes.nominationid=election_nominations.id WHERE election_nominations.electionid=$1 AND election_votes.username=$2 ORDER BY election_positions.id', [req.params.electionid, req.user.username]);
						}
					})
					.then(function (nominations) {
						res.render('services/elections_vote', {election: election, nominations: nominations, voted: voted});
					})
					.catch( function (err) {
						next(err);
					});
			}
		})
		.catch(function (err) {
			next(err);
		})
});

/* POST a vote */
router.post('/elections/:electionid', function (req, res, next) {
	req.db.one('SELECT COUNT(id) FROM election_votes WHERE username=$1 AND electionid=$2', [req.user.username, req.params.electionid])
		.then(function (voteCount) {
			if (voteCount.count != 0) {
				err = new Error("You have already voted in this election");
				err.status(400);
				return err;
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
			res.redirect(303, '/services/elections/'+req.params.electionid);
		})
		.catch( function (err) {
			next(err);
		})
});

module.exports = router;
