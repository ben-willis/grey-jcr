var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Position = require('../models/position');
var Blog = require('../models/blog');
var Folder = require('../models/folder');

/* GET home page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Position.getByType("exec").then(function(exec_members) {
			return Promise.all(
				exec_members.map(function(exec_member) {
					return exec_member.getUsers().then(function(users) {
						exec_member.users = users;
						return exec_member;
					});
				})
			)
		}),
		Position.getByType("officer").then(function(exec_members) {
			return Promise.all(
				exec_members.map(function(exec_member) {
					return exec_member.getUsers().then(function(users) {
						exec_member.users = users;
						return exec_member;
					});
				})
			)
		})
	]).then(function (positions) {
			res.render('jcr/index', {exec: positions[0], officers: positions[1]});
		}).catch(function (err) {
			next(err);
		});
});

/* GET blog page. */
router.get('/blog', function (req, res, next) {
	res.render('jcr/blog');
});

/* GET profile for a position page. */
router.get('/blog/:position_slug', function (req, res, next) {
	Position.findBySlug(req.params.position_slug).then(function(position){
		return Promise.all([
			position,
			position.getBlogs().then(function(blogs){
				return Promise.all(
					blogs.map(function(blog_data){
						blog = new Blog(blog_data);
						return blog.getAuthor().then(function(author){
							blog_data.author = author;
							return blog_data;
						})
					})
				)
			}),
			Folder.findForPosition(position.id)
		])
	}).then(function(data) {
		res.render('jcr/profile', { blogs: data[1], position: data[0], folder: data[2]});
	}).catch(function (err) {
		next(err);
	});
});

router.get('/blog/:position/:year/:month/:date/:slug', function (req, res, next) {
	Blog.findBySlugAndDate(req.params.slug, new Date(req.params.year, parseInt(req.params.month)-1, req.params.date)).then(function (blog) {
		return Promise.all([
			blog,
			blog.getAuthor(),
			blog.getPosition()
		])
	}).then(function(data){
		blog = data[0];
		blog.author = new User(data[1]);
		blog.position = new Position(data[2]);
		res.render('jcr/article', { blog: blog });
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
