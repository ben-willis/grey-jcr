var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	req.db.many('SELECT positions.title, positions.id, users.name, users.username FROM userPositions LEFT JOIN users ON userPositions.username=users.username LEFT JOIN positions ON userPositions.position=positions.id WHERE (level=2 OR position=14 OR position=15) ORDER BY positions.id ASC')
		.then(function (welfare) {
			res.render('welfare/index', {welfare: welfare});
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;
