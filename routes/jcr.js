var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	req.db.many('SELECT * FROM userPositions LEFT JOIN users ON userPositions.username=users.username LEFT JOIN positions ON userPositions.position=positions.id WHERE level>=3')
		.then(function (positions) {
			var exec = [];
			var officers = [];
			for (var i = 0; i < positions.length; i++) {
				if (positions[i].level == 4) {
					exec.push(positions[i]);
				} else {
					officers.push(positions[i]);
				}
			};
			res.render('jcr/index', {exec: exec, officers: officers});
		}).catch(function (err) {
			next(err);
		});
});

/* GET blog page. */
router.get('/blog', function (req, res, next) {
	// Get all the jcr officers positions
	req.db.manyOrNone('SELECT *, blog.title AS title, blog.slug AS slug, positions.title AS position_title, positions.slug AS position_slug FROM blog LEFT JOIN users ON blog.author=users.username LEFT JOIN positions ON blog.positionid=positions.id')
		.then(function (posts) {
			res.render('jcr/blog', { posts: posts});
		}).catch(function (err) {
			next(err);
		});
});

/* GET blog for a position page. */
router.get('/blog/:position', function (req, res, next) {
	// Get all the jcr officers positions
	req.db.manyOrNone("SELECT *, blog.title AS title, blog.slug AS slug, positions.title AS position_title, positions.slug AS positions_slug FROM blog LEFT JOIN users ON blog.author=users.username LEFT JOIN positions ON blog.positionid=positions.id WHERE positions.slug=$1", [req.params.position])
		.then(function (posts) {
			res.render('jcr/blog', { posts: posts});
		}).catch(function (err) {
			next(err);
		});
});

router.get('/blog/:position/:year/:month/:title', function (req, res, next) {
	req.db.one("SELECT *, blog.title AS title, blog.slug AS slug, positions.title AS position_title, positions.slug AS positions_slug FROM blog LEFT JOIN users ON blog.author=users.username LEFT JOIN positions ON blog.positionid=positions.id WHERE positions.slug=$1 AND EXTRACT(YEAR FROM blog.timestamp)=$2 AND EXTRACT(MONTH FROM blog.timestamp)=$3 AND blog.slug=$4", [req.params.position, req.params.year, req.params.month, req.params.title])
	.then(function (post) {1
		res.render('jcr/article', { post: post});
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
