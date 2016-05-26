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

router.post('/', function (req, res, next) {
	console.log(req.body);
	req.db.one('SELECT (COUNT(*)>0) as voted FROM poll_votes WHERE username=$1', [req.user.username])
		.then(function (data) {
			if (data.voted) {
				return res.status(400).json({'error': 'You have already voted'});
			}
			return req.db.none('INSERT INTO poll_votes(option_id, username) VALUES ($1, $2)', [req.body.option_id, req.user.username]);
		}).then(function (){
			return res.status(200).json({'success': 'Vote cast'});
		}).catch(function(err) {
			res.json(err);
		})
	
});

router.get('/', function (req,res,next) {
	var data = {};
	req.db.one('SELECT (COUNT(*)>0) as voted FROM poll_votes WHERE username=$1', [req.user.username])
		.then(function(result) {
			data.voted = result.voted;
			return req.db.many('SELECT id, name, (SELECT COUNT(*) FROM poll_votes WHERE poll_votes.option_id=poll_options.id) AS votes FROM poll_options')
		}).then(function (result) {
			data.results = result;
			for (var i = 0; i < data.results.length; i++) {
				data.results[i].votes = parseInt(data.results[i].votes);
			};
			return res.json({data: data});
		}).catch(function(err) {
			res.json(err);
		})
});

module.exports = router;