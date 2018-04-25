var express = require('express');
var htmlToText = require('html-to-text');
var router = express.Router();
var httpError = require('http-errors');

const Op = require("sequelize").Op;

var models = require("../models");

var auth = require('./auth');
var jcr = require('./jcr');
var services = require('./services');
var info = require('./info');
var support = require('./support');
var facilities = require('./facilities');
var events = require('./events');
var welfare = require('./welfare');
var sportsandsocs = require('./sportsandsocs');
var mcr = require('./mcr');
var api = require('./api');

/* GET home page. */
router.get('/', function (req, res, next) {
	Promise.all([
		models.blog.findAll({
			limit: 9,
			include: [{
				model: models.user,
				as: "author"
			}, models.role],
			order: [["updated", "DESC"]]
		}),
		models.event.findAll({
			where: {
				time: {[Op.gte]: new Date()}
			},
			order: [["time", "ASC"]]
		}),
		models.role.findAll({
			where: {
				level: { [Op.gte]: 4 }
			},
			include: [models.user]
		})
	]).then(function (data){
		var blogs = data[0].map((blog) => {
			blog.message = htmlToText.fromString(blog.message, {
				wordwrap: false,
				ignoreHref: true,
				ignoreImage: true
			}).slice(0, 200) + "...";
			return blog;
		});
		res.render('home', {blogs: blogs, events: data[1], exec: data[2]});
	}).catch(next);
});

/* GET offline page */
router.get('/offline', function(req,res,next) {
	res.render('error', {
		message: "Disconnected",
		error: {status: "We were unable to load the page you requested. Please check your network connection and try again."}
	});
});

router.use('/', auth);
router.use('/jcr/', jcr);
router.use('/services/', services);
router.use('/info/', info);
router.use('/support/', support);
router.use('/facilities/', facilities);
router.use('/events/', events);
router.use('/welfare/', welfare);
router.use('/sportsandsocs/', sportsandsocs);
router.use('/mcr/', mcr);
router.use('/api/', api);

module.exports = router;
