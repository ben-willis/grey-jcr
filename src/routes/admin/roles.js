var express = require('express');
var router = express.Router();
var validator = require('validator');
var httpError = require('http-errors');

var User = require('../../models/user');

import FileServiceImpl from "../../files/FileServiceImpl";
import RoleServiceImpl from "../../roles/RoleServiceImpl";
import { getConnection } from "typeorm";

const connection = getConnection("grey");

const fileService = new FileServiceImpl(connection.getRepository("File"), connection.getRepository("Folder"));
const roleService = new RoleServiceImpl(connection.getRepository("Role"), connection.getRepository("RoleUser"));

router.use(function (req, res, next) {
	if (req.user.level < 3) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	roleService.getRoles().then((roles) => {
		return Promise.all(roles.map(async role => {
			const users = await Promise.all(role.roleUsers.map(ru => {
				return User.findByUsername(ru.username);
			}));
			role.users = users;
			return role;
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
		}
		res.render('admin/roles', {exec: exec, officers: officers, welfare: welfare, reps: reps});
	}).catch(next);
});

router.post('/new', function (req, res, next) {
	roleService.createRole(req.body.title, "", Number(req.body.level)).then(role => {
		if (role.level == 4 || role.level == 5) {
			return fileService.createFolder(role.title, undefined, role.id);
		} else {
			return;
		}
	}).then(function(){
		res.redirect('/admin/roles');
	}).catch(next);
});

router.post('/:role_id/addUser', function (req, res, next) {
	roleService.addUserToRole(Number(req.params.role_id), req.body.username).then((role) => {
		res.redirect('/admin/roles');
	}).catch(next);
});

router.get('/:role_id/removeUser/:username', function (req, res, next) {
	roleService.removeUserFromRole(Number(req.params.role_id), req.params.username).then((role) => {
		res.redirect('/admin/roles');
	}).catch(next);
});

/* GET edit role page. */
router.get('/:role_id/edit', function (req, res, next) {
	roleService.getRoleById(Number(req.params.role_id)).then((role) => {
		res.render('admin/roles_edit', {role: role});
	}).catch(next);
});

router.post('/:role_id/edit', function (req, res, next) {
	roleService.updateRole(
		Number(req.params.role_id),
		req.body.title,
		req.body.description,
		req.body.level,
	).then(function (role) {
		res.redirect('/admin/roles');
	}).catch(next);
});

router.get('/:role_id/delete', function (req, res, next) {
	roleService.deleteRole(Number(req.params.role_id)).then(function () {
		res.redirect('/admin/roles');
	}).catch(next);
});

module.exports = router;
