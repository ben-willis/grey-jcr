var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	req.db.many('SELECT * FROM userPositions LEFT JOIN users ON userPositions.username=users.username LEFT JOIN positions ON userPositions.position=positions.id WHERE level=1')
		.then(function (reps) {
			res.render('support/index', {reps: reps});
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;
