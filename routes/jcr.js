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
			)
		}),
		Role.getByType("officer").then(function(exec_members) {
			return Promise.all(
				exec_members.map(function(exec_member) {
					return exec_member.getUsers().then(function(users) {
						exec_member.users = users;
						return exec_member;
					});
				})
			)
		})
	]).then(function (roles) {
			res.render('jcr/index', {exec: roles[0], officers: roles[1]});
		}).catch(function (err) {
			next(err);
		});
});

/* GET blog page. */
router.get('/blog', function (req, res, next) {
	Blog.getAll().then(function(blogs){
		res.render('jcr/blog', {blogs: blogs});
	}).catch(function (err) {
		next(err);
	});

});

/* GET profile for a role page. */
router.get('/blog/:role_slug', function (req, res, next) {
	Role.findBySlug(req.params.role_slug).then(function(role){
		return Promise.all([
			role,
			role.getBlogs().then(function(blog_ids){
				return Promise.all(
					blog_ids.map(function(blog_id){
						return Blog.findById(blog_id);
					})
				)
			}),
			Folder.findForRole(role.id)
		])
	}).then(function(data) {
		res.render('jcr/profile', { blogs: data[1], role: data[0], folder: data[2]});
	}).catch(function (err) {
		next(err);
	});
});

router.get('/blog/:role/:year/:month/:date/:slug', function (req, res, next) {
	Blog.findBySlugAndDate(req.params.slug, new Date(req.params.year, parseInt(req.params.month)-1, req.params.date)).then(function (blog) {
		res.render('jcr/article', { blog: blog });
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
