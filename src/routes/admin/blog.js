var express = require('express');
var router = express.Router();

import NewsService from "../../news/NewsService";
import { getConnection } from "typeorm";

const newsService = new NewsService(getConnection("grey"));

/* GET blog page. */
router.get('/', function (req, res, next) {
	newsService.getArticles({
		author: req.user.username,
		page: 1,
		limit: 1000,
	}).then(function (blogs) {
		return res.render('admin/blog', {blogs: blogs});
	}).catch(function (err) {
		return next(err);
	});
});

/* POST a new blog */
router.post('/new', function (req, res, next) {
	newsService.createArticle({
		title: req.body.title,
		content: req.body.content,
		author: req.user.username,
		roleId: Number(req.body.role)
	}).then(function (){
		return res.redirect('/admin/blog');
	}).catch(function (err) {
		return next(err);
	});
});

/* GET edit blog page. */
router.get('/:blog_id/edit', function (req, res, next) {
	newsService.getArticle({articleId: Number(req.params.blog_id)}).then(function (blog) {
		return res.render('admin/blog_edit', {blog: blog});
	}).catch(function (err) {
		return next(err);
	});
});

/* POST and update to a blog */
router.post('/:blog_id/edit', function (req, res, next) {
	newsService.updateArticle({
		articleId: Number(req.params.blog_id),
		title: req.body.title,
		content: req.body.content
	}).then(function () {
		return res.redirect('/admin/blog');
	}).catch(function (err) {
		return next(err);
	});
});

/* GET a delete blog post */
router.get('/:blog_id/delete', function (req, res, next) {
	newsService.getArticle({articleId: Number(req.params.blog_id)}).then(function (article) {
		return newsService.deleteArticle(article);
	}).then(function () {
		return res.redirect('/admin/blog');
	}).catch(function (err) {
		return next(err);
	});
});

module.exports = router;
