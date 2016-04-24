var express = require('express');
var router = express.Router();
var validator = require('validator');

router.use(function (req, res, next) {
	if (req.user.level<5 ) {
		err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	} else {
		return next();
	}
});

/* GET feedback page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT feedback.id, feedback.title, feedback.timestamp, feedback.author, feedback.anonymous, users.name, (SELECT COUNT(*) FROM feedback AS replies WHERE replies.parentid=feedback.id) AS no_replies FROM feedback LEFT JOIN users ON feedback.author=users.username WHERE parentid IS NULL ORDER BY timestamp DESC')
		.then(function (feedback) {
			res.render('admin/feedback', {feedback: feedback});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET an individual feedback */
router.get('/:feedbackid', function (req, res, next) {
	req.db.many('SELECT feedback.id, feedback.title, feedback.message, feedback.timestamp, feedback.exec ,users.name, feedback.author, feedback.anonymous FROM feedback LEFT JOIN users ON feedback.author=users.username WHERE id=$1 OR parentid=$1 ORDER BY timestamp ASC', [req.params.feedbackid])
		.then(function (feedback) {
			res.render('admin/feedback_view', {feedback: feedback});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a reply */
router.post('/:feedbackid', function (req, res, next) {
	req.db.none('INSERT INTO feedback(title, message, author, exec, parentid, anonymous) VALUES ($1, $2, $3, $4, $5, $6)', ['reply', req.body.message, req.user.username, true, req.params.feedbackid, false])
		.then(function(){
			return req.db.none('UPDATE feedback SET read_by_user=false WHERE id=$1', [req.params.feedbackid]);
		})
		.then(function () {
			res.redirect(303, '/admin/feedback/'+req.params.feedbackid)
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
