var express = require('express');
var router = express.Router();

const User = require("../models/user");

import RoleServiceImpl from "../roles/RoleServiceImpl";

import { getConnection } from "typeorm";

const connection = getConnection("grey");

const roleService = new RoleServiceImpl(connection.getRepository("Role"), connection.getRepository("RoleUser"));

/* GET home page. */
router.get('/', function (req, res, next) {
	roleService.getRoleBySlug("Tech-Officer").then(async (role) => {
		if (!role) return role;
		const users = await Promise.all(role.roleUsers.map(ru => {
			return User.findByUsername(ru.username);
		}));
		role.users = users;
		return role;
	}).then(function (tech) {
		res.render('tech/index', {tech: tech});
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
