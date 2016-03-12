var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET home page. */
router.get('/', function (req, res, next) {
	req.db.many('SELECT positions.id, positions.title, positions.level, positions.description, users.username, users.name FROM positions FULL JOIN userPositions ON userPositions.position=positions.id LEFT JOIN users ON userPositions.username=users.username ORDER BY positions.id ASC')
		.then(function (positions) {
			var exec = [];
			var officers = [];
			var welfare = [];
			var reps = [];
			for (var i = 0; i < positions.length; i++) {
				if (positions[i].level == 4) {
					exec.push(positions[i]);
				} else if (positions[i].level == 3 || positions[i].id == 1) {
					officers.push(positions[i]);
				} else if (positions[i].level == 2) {
					welfare.push(positions[i]);
				} else {
					reps.push(positions[i]);
				}
			};
			res.render('admin/positions', {exec: exec, officers: officers, welfare: welfare, reps: reps});
		}).catch(function (err) {
			next(err);
		});
});

router.post('/new', function (req, res, next) {
	if (validator.isNull(req.body.title) || !validator.isIn(req.body.level, ["1", "2", "3", "4"])) {
		err = new Error("Bad Request");
		return next(err);
	}
	req.db.none("INSERT INTO positions(title, level, slug) VALUES ($1, $2, $3)", [req.body.title, req.body.level, slugify(req.body.title)]).then(function(){
		res.redirect('/admin/positions');
	}).catch(function (err) {
		next(err);
	})
});

router.post('/:positionid/addUser', function (req, res, next) {
	req.db.none("INSERT INTO userPositions(username, position) VALUES ($1, $2)", [req.body.username, req.params.positionid])
		.then(function () {
			res.redirect('/admin/positions');
		}).catch(function (err) {
			return next(err);
		});
});

router.get('/:positionid/removeUser/:username', function (req, res, next) {
	req.db.none("DELETE FROM userPositions WHERE username=$1 AND position=$2", [req.params.username, req.params.positionid])
		.then(function () {
			res.redirect('/admin/positions');
		}).catch( function (err) {
			return next(err);
		});
});

/* GET edit position page. */
router.get('/:positionid/edit', function (req, res, next) {
	req.db.one('SELECT positions.id, positions.title, positions.description FROM positions WHERE positions.id=$1', req.params.positionid)
		.then(function (position) {
			res.render('admin/positions_edit', {position: position});
		}).catch(function (err) {
			next(err);
		});
});

router.post('/:positionid/edit', function (req, res, next) {
	req.db.none("UPDATE positions SET title=$1, description=$2, slug=$3 WHERE id=$4", [req.body.title, req.body.description, slugify(req.body.title), req.params.positionid])
		.then(function () {
			res.redirect('/admin/positions');
		})
		.catch(function (err) {
			next(err);
		})
});

router.get('/:positionid/delete', function (req, res, next) {
	req.db.none("DELETE FROM userPositions WHERE position=$1; DELETE FROM positions WHERE id=$1;", req.params.positionid)
		.then(function () {
			res.redirect('/admin/positions');
		})
		.catch(function (err) {
			next(err);
		})
});

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

module.exports = router;
