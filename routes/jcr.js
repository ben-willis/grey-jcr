var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Position = require('../models/position');
var Blog = require('../models/blog');

/* GET home page. */
router.get('/', function (req, res, next) {
	Position.getByLevel(">", 2).then(function(positions) {
		return Promise.all(
			positions.map(function(position) {
				return position.getUsers().then(function(users) {
					position.users = users;
					return position;
				});
			})
		)
	}).then(function (positions) {
			var exec = [];
			var officers = [];
			for (var i = 0; i < positions.length; i++) {
				if (positions[i].level >= 4 && positions[i].id != 1) {
					exec.push(positions[i]);
				} else {
					officers.push(positions[i]);
				}
			};
			res.render('jcr/index', {exec: exec, officers: officers});
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
			})
		])
	}).then(function(data) {
		res.render('jcr/profile', { blogs: data[1], position: data[0]});
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
		res.render('jcr/article', { blog: blog});
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
