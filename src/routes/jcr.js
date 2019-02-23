var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Blog = require('../models/blog');

import FileServiceImpl from "../files/FileServiceImpl";
import RoleServiceImpl from "../roles/RoleServiceImpl";

import { getConnection } from "typeorm";

const connection = getConnection("grey");

const fileService = new FileServiceImpl(connection.getRepository("File"), connection.getRepository("Folder"));
const roleService = new RoleServiceImpl(connection.getRepository("Role"), connection.getRepository("RoleUser"));

/* GET home page. */
router.get('/', function (req, res, next) {
	const exec = Promise.all([roleService.getRoles(5), roleService.getRoles(4)]).then(data => data[0].concat(data[1]));
	const officers = roleService.getRoles(3);
	Promise.all([
		exec.then(function(roles) {
			return Promise.all(roles.map(async role => {
				const users = await Promise.all(role.roleUsers.map(ru => {
					return User.findByUsername(ru.username);
				}));
				role.users = users;
				return role;
			}));
		}),
		officers.then(function(roles) {
			return Promise.all(roles.map(async role => {
				const users = await Promise.all(role.roleUsers.map(ru => {
					return User.findByUsername(ru.username);
				}));
				role.users = users;
				return role;
			}));
		})
	]).then(function (roles) {
		res.render('jcr/index', {exec: roles[0], officers: roles[1]});
	}).catch(next);
});

/* GET blog page. */
router.get('/blog', function (req, res, next) {
	if (req.user) req.user.updateLastLogin();
	res.render("jcr/blog");
});

/* GET profile for a role page. */
router.get('/blog/:role_slug', function (req, res, next) {
	if (req.user) {
		req.user.updateLastLogin();
	}
	var page = parseInt(req.query.page) || 1;
	var limit = parseInt(req.query.limit) || 6;
	roleService.getRoleBySlug(req.params.role_slug).then(function(role){
		return Promise.all([
			role,
			Blog.get(role.id),
			Promise.all(role.roleUsers.map(ru => User.findByUsername(ru.username))),
			fileService.getFolderForOwner(role.id)
		]);
	}).then(function(data) {
		data[0].users = data[2];
		res.render('jcr/profile', {
			page: (data[1].length === 0) ? 0 : page,
			limit: limit,
			total_pages: Math.ceil(data[1].length / limit),
			blogs: data[1].splice((page-1) * limit, page*limit),
			role: data[0],
			folder: data[3]});
	}).catch(function (err) {
		next(err);
	});
});

router.get('/blog/:role/:year/:month/:date/:slug', function (req, res, next) {
	if (req.user) req.user.updateLastLogin();
	res.render("jcr/blog");
});

module.exports = router;
