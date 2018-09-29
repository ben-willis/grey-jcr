var express = require('express');
var router = express.Router();

var slugify = require("slug");

const models = require("../../models");

/* GET blog page. */
router.get('/', function (req, res, next) {
	models.blog.findAll({
		where: {author_username: req.user.username},
		include: [models.role]
	}).then(function (blogs) {
		return res.render('admin/blog', {blogs: blogs});
	}).catch(next);
});

/* POST a new blog */
router.post('/new', function (req, res, next) {
	models.blog.create({
		title: req.body.title,
		slug: slugify(req.body.title),
		message: req.body.message,
		author_username: req.user.username,
		role_id: req.body.role
	}).then(function (){
		return res.redirect('/admin/blog');
	}).catch(next);
});

/* GET edit blog page. */
router.get('/:blog_id/edit', function (req, res, next) {
	models.blog.findById(req.params.blog_id).then(function (blog) {
		return res.render('admin/blog_edit', {blog: blog});
	}).catch(next);
});

/* POST and update to a blog */
router.post('/:blog_id/edit', function (req, res, next) {
	models.blog.findById(req.params.blog_id).then(function (blog) {
		return blog.update({
			title: req.body.title,
			message: req.body.message
		});
	}).then(function () {
		return res.redirect('/admin/blog');
	}).catch(next);
});

/* GET a delete blog post */
router.get('/:blog_id/delete', function (req, res, next) {
	models.blog.findById(req.params.blog_id).then(function (blog) {
		return blog.destroy();
	}).then(function () {
		return res.redirect('/admin/blog');
	}).catch(next);
});

module.exports = router;
