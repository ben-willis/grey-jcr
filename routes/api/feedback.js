var express = require('express');
var router = express.Router();
var treeize   = require('treeize');

router.use(function (req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		err = new Error("Unauthenticated")
		err.status = 401;
		return res.json(err);
	}
});

router.get('/new', function (req, res, next) {
	req.db.manyOrNone("SELECT feedback.id, feedback.title FROM feedback WHERE read_by_user=false AND parentid IS NULL AND exec=false AND author=$1", [req.user.username])
		.then(function(feedback) {
			res.json({data: feedback});
		})
		.catch(function(err) {
			res.json(err);
		})
});

router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT feedback.id, feedback.title, feedback.archived, feedback.read_by_user, (SELECT COUNT(*) FROM feedback AS replies WHERE replies.parentid=feedback.id) AS no_replies, feedback.timestamp FROM feedback LEFT JOIN users ON feedback.author=users.username WHERE author=$1 AND parentid IS NULL AND exec=false ORDER BY timestamp DESC', req.user.username)
		.then(function (feedback) {
			res.status(200).json({data: feedback});
		})
		.catch(function (err) {
			res.json(err);
		});
});

router.post('/', function (req, res, next) {
	req.db.one('INSERT INTO feedback(title, message, author, exec, anonymous) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, archived, read_by_user, timestamp', [req.body.title, req.body.message, req.user.username, false, req.body.anonymous])
		.then(function (feedback) {
			feedback.no_replies = 0;
			res.status(201).json({data: feedback});
		})
		.catch(function (err) {
			res.json(err);
		});
});

module.exports = router;