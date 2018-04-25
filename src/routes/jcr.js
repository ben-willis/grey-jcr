var express = require('express');
var router = express.Router();

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

var models = require("../models");

/* GET home page. */
router.get('/', function (req, res, next) {
	Promise.all([
		models.role.findAll({
			where: {
				level: {
					[Op.gte]: 4
				}
			},
			include: models.user
		}),
		models.role.findAll({
			where: {
				level: {
					[Op.eq]: 3
				}
			},
			include: models.user
		})
	]).then(function ([exec, officers]) {
		res.render('jcr/index', {exec: exec, officers: officers});
	}).catch(next);
});

/* GET blog page. */
router.get('/blog', function (req, res, next) {
	if (req.user) req.user.update({last_login: new Date()});
	var filters = {
		role_id: parseInt(req.query.role_id) || null,
		year: parseInt(req.query.year) || null,
		month: parseInt(req.query.month) || null
	};
	var page = parseInt(req.query.page) || 1;
	var limit = parseInt(req.query.limit) || 10;

	Promise.all([
		models.blog.findAll({
			where: Object.keys(filters).forEach((key) => (filters[key] === null) && delete filters[key]),
			include: [models.role, {model: models.user, as: "author"}],
			limit: limit,
			offset: (page - 1) * limit,
			order: [["updated", "DESC"]]
		}),
		models.role.findAll({
			where: {
				level: {
					[Op.gte]: 4
				}
			}
		})
	]).then(function([blogs, roles]) {
		var total_pages = Math.ceil(blogs.length / limit);
		var page = (blogs.length === 0) ? 0 : page;
		res.render('jcr/blog', {
			page: page,
			limit: limit,
			total_pages: total_pages,
			filters: filters,
			blogs: blogs,
			roles: roles
		});
	}).catch(next);
});

/* GET profile for a role page. */
router.get('/blog/:role_slug', function (req, res, next) {
	if (req.user) req.user.update({last_login: new Date()});
	var page = parseInt(req.query.page) || 1;
	var limit = parseInt(req.query.limit) || 6;

	models.role.findOne({
		where: {
			slug: req.params.role_slug
		},
		include: [{
			model: models.blog,
			order: [["updated", "DESC"]],
			include: [{
				model: models.user,
				as: "author"
			}]
		}, models.user, models.folder]
	}).then(function(role){
		res.render('jcr/profile', {
			page: (role.blogs.length === 0) ? 0 : page,
			limit: limit,
			total_pages: Math.ceil(role.blogs.length / limit),
			blogs: role.blogs.splice((page-1) * limit, page*limit),
			role: role,
			folder: role.folder
		});
	}).catch(next);
});

router.get('/blog/:role/:year/:month/:date/:slug', function (req, res, next) {
	if (req.user) req.user.update({last_login: new Date()});

	models.blog.findOne({
		where: {
			slug: req.params.slug,
			updated: {
				[Op.between]: [
					new Date(req.params.year, parseInt(req.params.month)-1, req.params.date),
					new Date(req.params.year, parseInt(req.params.month), req.params.date)
				]
			}
		},
		include: [models.role, {model: models.user, as: "author"}]
	}).then(function (blog) {
		res.render('jcr/article', { blog: blog });
	}).catch(next);
});

module.exports = router;
