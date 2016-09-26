var express = require('express');
var router = express.Router();
var validator = require('validator');
var Position = require('../../models/position');
var Folder = require('../../models/folder');

router.use(function (req, res, next) {
	if (req.user.level<5 ) {
		err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	} else {
		return next();
	}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	Position.getAll().then(function (positions) {
		return Promise.all(positions.map(function(position){
			return position.getUsers().then(function(users) {
				position.users = users;
				return position;
			});
		}));
	}).then(function(positions){
		var exec = [];
		var officers = [];
		var welfare = [];
		var reps = [];
		for (var i = 0; i < positions.length; i++) {
			if (positions[i].level >= 4 && positions[i].id != 1) {
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
	if (validator.isNull(req.body.title) || !validator.isIn(req.body.level, ["1", "2", "3", "4", "5"])) {
		err = new Error("Bad Request");
		return next(err);
	}
	Position.create(req.body.title, parseInt(req.body.level)).then(function (position) {
		if (position.level == 4 || position.level == 5) {
			return Folder.create(position.title, position.id);
		}
		return;
	}).then(function(){
		res.redirect('/admin/positions');
	}).catch(function (err) {
		next(err);
	})
});

router.post('/:position_id/addUser', function (req, res, next) {
	var position_id = parseInt(req.params.position_id);
	var username = req.body.username;
	Position.findById(position_id).then(function(position) {
		return position.assignUser(username);
	}).then(function () {
		res.redirect('/admin/positions');
	}).catch(function (err) {
		return next(err);
	});
});

router.get('/:position_id/removeUser/:username', function (req, res, next) {
	var position_id = parseInt(req.params.position_id);
	var username = req.params.username;
	Position.findById(position_id).then(function(position) {
		return position.removeUser(username);
	}).then(function () {
		res.redirect('/admin/positions');
	}).catch(function (err) {
		return next(err);
	});
});

/* GET edit position page. */
router.get('/:position_id/edit', function (req, res, next) {
	Position.findById(parseInt(req.params.position_id)).then(function (position) {
			res.render('admin/positions_edit', {position: position});
		}).catch(function (err) {
			next(err);
		});
});

router.post('/:position_id/edit', function (req, res, next) {
	Position.findById(parseInt(req.params.position_id)).then(function (position) {
			return position.setDescription(req.body.description);
		}).then(function () {
			res.redirect('/admin/positions');
		}).catch(function (err) {
			next(err);
		})
});

router.get('/:position_id/delete', function (req, res, next) {
	Position.findById(parseInt(req.params.position_id)).then(function (position) {
			return position.delete();
		}).then(function () {
			res.redirect('/admin/positions');
		}).catch(function (err) {
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
