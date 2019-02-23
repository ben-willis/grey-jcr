var express = require('express');
var router = express.Router();

const User = require("../models/user");

import RoleServiceImpl from "../roles/RoleServiceImpl";

import { getConnection } from "typeorm";

const connection = getConnection("grey");

const roleService = new RoleServiceImpl(connection.getRepository("Role"), connection.getRepository("RoleUser"));

/* GET home page. */
router.get('/', function (req, res, next) {
	const reps = roleService.getRoles(1);
	const repsOfficer = roleService.getRoleBySlug("representatives-officer");
	const seniorFreshersRep = roleService.getRoleBySlug("senior-freshers-representative");
	Promise.all([
		reps.then(function(roles) {
			return Promise.all(roles.map(async role => {
				const users = await Promise.all(role.roleUsers.map(ru => {
					return User.findByUsername(ru.username);
				}));
				role.users = users;
				return role;
			}));
		}),
		repsOfficer.then(async role => {
			const users = await Promise.all(role.roleUsers.map(ru => {
				return User.findByUsername(ru.username);
			}));
			role.users = users;
			return role;
		}),
		seniorFreshersRep.then(async role => {
			const users = await Promise.all(role.roleUsers.map(ru => {
				return User.findByUsername(ru.username);
			}));
			role.users = users;
			return role;
		}),
	]).then(function (roles) {
		res.render('reps/index', {reps: roles[0], reps_officer: roles[1], sf_rep: roles[2]});
	}).catch(next);
});

module.exports = router;