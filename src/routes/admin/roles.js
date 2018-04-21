var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');
var slugify = require("slug");

var models = require("../../models");

router.use(function (req, res, next) {
	if (req.user.level < 3) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	models.role.findAll().then(function(roles){
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
		}
		res.render('admin/roles', {exec: exec, officers: officers, welfare: welfare, reps: reps});
	}).catch(next);
});

router.post('/new', function (req, res, next) {
	if (validator.isNull(req.body.title) || !validator.isIn(req.body.level, ["1", "2", "3", "4", "5"])) {
		var err = new Error("Bad Request");
		return next(err);
	}
	models.role.create({
		title: req.body.title,
		level: parseInt(req.body.level),
		slug: slugify(req.body.title)
	}).then(function(role) {
		if (role.level == 4 || role.level == 5) {
			return models.folder.create({
				name: role.title,
				owner: role.id
			});
		} else return;
	}).then(function(){
		res.redirect('/admin/roles');
	}).catch(next);
});

router.post('/:role_id/addUser', function (req, res, next) {
	User.findByUsername(req.body.username).then(function(user) {
		return user.assignRole(parseInt(req.params.role_id));
	}).then(function () {
		res.redirect('/admin/roles');
	}).catch(next);
});

router.get('/:role_id/removeUser/:username', function (req, res, next) {
	User.findByUsername(req.params.username).then(function(user) {
		return user.removeRole(parseInt(req.params.role_id));
	}).then(function () {
		res.redirect('/admin/roles');
	}).catch(next);
});

/* GET edit role page. */
router.get('/:role_id/edit', function (req, res, next) {
	models.role.findById(req.params.role_id).then(function(role) {
		res.render('admin/roles_edit', {role: role.toJSON()});
	}).catch(next);
});

router.post('/:role_id/edit', function (req, res, next) {
	models.role.findById(req.params.role_id).then(function (role) {
			return role.update({
				description: req.body.description
			});
		}).then(function(role) {
			res.redirect('/admin/roles');
		}).catch(next);
});

router.get('/:role_id/delete', function (req, res, next) {
	models.role.findById(req.params.role_id).then(function (role) {
			return role.destroy();
		}).then(function () {
			res.redirect('/admin/roles');
		}).catch(function (err) {
			next(err);
		});
});

module.exports = router;
