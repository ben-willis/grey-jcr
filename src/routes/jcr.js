var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Role = require('../models/role');
var Blog = require('../models/blog');
var Folder = require('../models/folder');

/* GET home page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Role.getByType("exec").then(function(exec_members) {
			return Promise.all(
				exec_members.map(function(exec_member) {
					return exec_member.getUsers().then(function(users) {
						exec_member.users = users;
						return exec_member;
					});
				})
			);
		}),
		Role.getByType("officer").then(function(exec_members) {
			return Promise.all(
				exec_members.map(function(exec_member) {
					return exec_member.getUsers().then(function(users) {
						exec_member.users = users.filter(user => (user.username != "hsdz38"));
						return exec_member;
					});
				})
			);
		})
	]).then(function (roles) {
			res.render('jcr/index', {exec: roles[0], officers: roles[1]});
		}).catch(function (err) {
			next(err);
		});
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
	Role.findBySlug(req.params.role_slug).then(function(role){
		return Promise.all([
			role,
			Blog.get(role.id),
			role.getUsers(),
			Folder.findForRole(role.id)
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
