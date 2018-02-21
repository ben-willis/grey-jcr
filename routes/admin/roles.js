var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');

var Role = require('../../models/role');
var Folder = require('../../models/folder');

router.use(function (req, res, next) {
	if (req.user.level < 3) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	Role.getAll().then(function (roles) {
		return Promise.all(roles.map(function(role){
			return role.getUsers().then(function(users) {
				role.users = users;
				return role;
			});
		}));
	}).then(function(roles){
		var exec = [];
		var officers = [];
		var welfare = [];
		var reps = [];
		for (var i = 0; i < roles.length; i++) {
			if (roles[i].level >= 4 && roles[i].id != 1) {
				exec.push(roles[i]);
			} else if (roles[i].level == 3 || roles[i].id == 1) {
				officers.push(roles[i]);
			} else if (roles[i].level == 2) {
				welfare.push(roles[i]);
			} else {
				reps.push(roles[i]);
			}
		};
		res.render('admin/roles', {exec: exec, officers: officers, welfare: welfare, reps: reps});
	}).catch(function (err) {
		next(err);
	});
});

router.post('/new', function (req, res, next) {
	if (validator.isNull(req.body.title) || !validator.isIn(req.body.level, ["1", "2", "3", "4", "5"])) {
		err = new Error("Bad Request");
		return next(err);
	}
	Role.create(req.body.title, parseInt(req.body.level)).then(function (role) {
		if (role.level == 4 || role.level == 5) {
			return Folder.create(role.title, role.id);
		}
		return;
	}).then(function(){
		res.redirect('/admin/roles');
	}).catch(function (err) {
		next(err);
	})
});

router.post('/:role_id/addUser', function (req, res, next) {
	var role_id = parseInt(req.params.role_id);
	var username = req.body.username;
	Role.findById(role_id).then(function(role) {
		return role.assignUser(username);
	}).then(function () {
		res.redirect('/admin/roles');
	}).catch(function (err) {
		return next(err);
	});
});

router.get('/:role_id/removeUser/:username', function (req, res, next) {
	var role_id = parseInt(req.params.role_id);
	var username = req.params.username;
	Role.findById(role_id).then(function(role) {
		return role.removeUser(username);
	}).then(function () {
		res.redirect('/admin/roles');
	}).catch(function (err) {
		return next(err);
	});
});

/* GET edit role page. */
router.get('/:role_id/edit', function (req, res, next) {
	Role.findById(parseInt(req.params.role_id)).then(function (role) {
			res.render('admin/roles_edit', {role: role});
		}).catch(function (err) {
			next(err);
		});
});

router.post('/:role_id/edit', function (req, res, next) {
	Role.findById(parseInt(req.params.role_id)).then(function (role) {
			return role.setDescription(req.body.description);
		}).then(function () {
			res.redirect('/admin/roles');
		}).catch(function (err) {
			next(err);
		})
});

router.get('/:role_id/delete', function (req, res, next) {
	Role.findById(parseInt(req.params.role_id)).then(function (role) {
			return role.delete();
		}).then(function () {
			res.redirect('/admin/roles');
		}).catch(function (err) {
			next(err);
		})
});

module.exports = router;
