var express = require('express');
var router = express.Router();
var httpError = require('http-errors');

var User = require('../../models/user');

var models = require("../../models");

router.use(function (req, res, next) {
	if (req.user.level < 5) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET feedback page. */
router.get('/', function (req, res, next) {
	var archive = (req.query.archive !== undefined);
	models.feedback.findAll({
		where: {archived: archive, parent_id: null},
	  include: [{
      model: models.feedback,
      as: "replies"
    }]
  }).then(function (feedbacks) {
		res.render('admin/feedback', {feedbacks: feedbacks, archive: archive});
	}).catch(next);
});

/* GET an individual feedback */
router.get('/:feedback_id', function (req, res, next) {
		var feedbackPromise = models.feedback.findById(req.params.feedback_id, {
		include: [{
			model: models.feedback,
			as: "replies"
		}]
	});
	var authorPromise = feedbackPromise.then(function(feedback) {
		return User.findByUsername(feedback.author);
	});

	Promise.all([feedbackPromise, authorPromise]).then(function([feedback, author]) {
		res.render('admin/feedback_view', {feedback: feedback, author: author});
	}).catch(next);
});

/* GET an archive some feedback */
router.get('/:feedback_id/toggle-archive', function (req, res, next) {
	models.feedback.findById(req.params.feedback_id).then(function(feedback) {
		return feedback.update({
			archived: !feedback.archived
		});
	}).then(function () {
		res.redirect(303, '/admin/feedback/?archive-success');
	}).catch(next);
});

/* POST a reply */
router.post('/:feedback_id', function (req, res, next) {
	models.feedback.findById(req.params.feedback_id).then(function(feedback) {
		return Promise.all([
			feedback.update({archived: false, read_by_user: false}),
			models.feedback.create({
				title: "reply",
				message: req.body.message,
				author: req.user.username,
				parent_id: feedback.id,
				read_by_user: false,
				exec: true
			})
		]);
	}).then(function ([feedback, reply]) {
		res.redirect(303, '/admin/feedback/'+feedback.id);
	}).catch(next);
});

module.exports = router;
