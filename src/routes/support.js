var express = require('express');
var router = express.Router();

import RoleServiceImpl from "../roles/RoleServiceImpl";

import { getConnection } from "typeorm";

const connection = getConnection("grey");

const roleService = new RoleServiceImpl(connection.getRepository("Role"), connection.getRepository("RoleUser"));

/* GET home page. */
router.get('/', function (req, res, next) {
	const officers = roleService.getRoles(1);
	const repsOfficer = roleService.getRoleBySlug("representatives-officer");
	const sfRep = roleService.getRoleBySlug("senior-freshers-representative");
	Promise.all([
		officers.then(function(roles) {
			return Promise.all(roles.map(async role => {
				const users = await Promise.all(role.roleUsers.map(ru => {
					return User.findByUsername(ru.username);
				}));
				role.users = users;
				return role;
			}));
		}),
		repsOfficer.then(async role => {
			if (!role) return role;
			const users = await Promise.all(role.roleUsers.map(ru => {
				return User.findByUsername(ru.username);
			}));
			role.users = users;
			return role;
		}),
		sfRep.then(async role => {
			if (!role) return role;
			const users = await Promise.all(role.roleUsers.map(ru => {
				return User.findByUsername(ru.username);
			}));
			role.users = users;
			return role;
		})
	]).then(function (roles) {
		res.render('support/index', {reps: roles[0], reps_officer: roles[1], sf_rep: roles[2]});
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
