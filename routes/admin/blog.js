var express = require('express');
var router = express.Router();
var validator = require('validator');
var Blog = require('../../models/blog');
var Position = require('../../models/position');

/* GET blog page. */
router.get('/', function (req, res, next) {
	req.user.getBlogs().then(function(blog_datas) {
		return Promise.all( blog_datas.map(function(data){
				return Position.findById(data.position_id).then(function(position_data){
					blog = new Blog(data);
					blog.position = new Position(position_data);
					return blog;
				})
			})
		)
	}).then(function (blogs) {
		return res.render('admin/blog', {blogs: blogs});
	}).catch(function (err) {
		return next(err);
	});
});

/* POST a new blog */
router.post('/new', function (req, res, next) {
	Blog.create({
		title: req.body.title,
		message: req.body.message,
		author: req.user.username,
		position_id: parseInt(req.body.position)
	}).then(function (){
		return res.redirect('/admin/blog')
	}).catch(function (err) {
		return next(err);
	});
});

/* GET edit blog page. */
router.get('/:blog_id/edit', function (req, res, next) {
	Blog.findById(parseInt(req.params.blog_id)).then(function (blog) {
		return res.render('admin/blog_edit', {blog: blog});
	}).catch(function (err) {
		return next(err);
	});
});

/* POST and update to a blog */
router.post('/:blog_id/edit', function (req, res, next) {
	Blog.findById(parseInt(req.params.blog_id)).then(function (blog) {
		return blog.update({
			title: req.body.title,
			message: req.body.message
		})
	}).then(function () {
		return res.redirect('/admin/blog')
	}).catch(function (err) {
		return next(err);
	});
});

/* GET a delete blog post */
router.get('/:blog_id/delete', function (req, res, next) {
	Blog.findById(parseInt(req.params.blog_id)).then(function (blog) {
		return blog.delete()
	}).then(function () {
		return res.redirect('/admin/blog')
	}).catch(function (err) {
		return next(err);
	});
})

module.exports = router;
