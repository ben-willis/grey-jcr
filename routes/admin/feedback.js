var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');

var Feedback = require('../../models/feedback');
var User = require('../../models/user');

router.use(function (req, res, next) {
	if (req.user.level < 5) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET feedback page. */
router.get('/', function (req, res, next) {
	Feedback.getAll(false).then(function(feedbacks) {
		return Promise.all(
			feedbacks.map(function(feedback) {
				return feedback.getReplies().then(function(replies) {
					feedback.replies = replies;
					return User.findByUsername(feedback.author);
				}).then(function(user) {
					feedback.author = (feedback.anonymous) ? null : user;
					return feedback;
				});
			})
		);
	}).then(function (feedbacks) {
		res.render('admin/feedback', {feedbacks: feedbacks, archive: false});
	}).catch(function (err) {
		next(err);
	});
});

router.get('/archive', function (req, res, next) {
	Feedback.getAll(true).then(function(feedbacks) {
		return Promise.all(
			feedbacks.map(function(feedback) {
				return feedback.getReplies().then(function(replies) {
					feedback.replies = replies;
					return User.findByUsername(feedback.author);
				}).then(function(user) {
					feedback.author = (feedback.anonymous) ? null : user;
					return feedback;
				});
			})
		);
	}).then(function (feedbacks) {
		res.render('admin/feedback', {feedbacks: feedbacks, archive: true});
	}).catch(function (err) {
		next(err);
	});
});

/* GET an individual feedback */
router.get('/:feedback_id', function (req, res, next) {
	Feedback.findById(parseInt(req.params.feedback_id)).then(function(feedback) {
		return Promise.all([
			feedback,
			feedback.getReplies().then(function(replies) {
				return Promise.all(
					replies.map(function(reply) {
						return User.findByUsername(reply.author).then(function(user) {
							reply.author = (feedback.anonymous && !reply.exec) ? null: user;
							return reply;
						});
					})
				);
			}),
			User.findByUsername(feedback.author).then(function(user) {
				return (feedback.anonymous) ? null: user;
			})
		]);
	}).then(function (data) {
		data[0].author = data[2];
		return res.render('admin/feedback_view', {feedback: data[0], replies: data[1]});
	}).catch(function (err) {
		return next(err);
	});
});

/* GET an archive some feedback */
router.get('/:feedback_id/toggle-archive', function (req, res, next) {
	Feedback.findById(parseInt(req.params.feedback_id)).then(function(feedback) {
		return feedback.toggleArchived();
	}).then(function (feedback) {
		res.redirect(303, '/admin/feedback/?archive-success');
	}).catch(function (err) {
		next(err);
	});
});

/* POST a reply */
router.post('/:feedback_id', function (req, res, next) {
	Feedback.findById(parseInt(req.params.feedback_id)).then(function(feedback) {
		return feedback.addReply(req.body.message, true, req.user.username);
	}).then(function () {
		res.redirect(303, '/admin/feedback/'+req.params.feedback_id);
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
