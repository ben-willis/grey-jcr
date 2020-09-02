var express = require('express');
var htmlToText = require('html-to-text');
var router = express.Router();
var httpError = require('http-errors');

var Event = require('../models/event');
var User = require('../models/user');

var auth = require('./auth');
var jcr = require('./jcr');
var handbook = require('./handbook');
var services = require('./services');
var info = require('./info');
var support = require('./support');
var reps = require('./reps');
var facilities = require('./facilities');
var tech = require('./tech');
var events = require('./events');
var welfare = require('./welfare');
var sportsandsocs = require('./sportsandsocs');
var mcr = require('./mcr');
var api = require('./api');

import RoleServiceImpl from "../roles/RoleServiceImpl";

import { getConnection } from "typeorm";

const connection = getConnection("grey");

const roleService = new RoleServiceImpl(connection.getRepository("Role"), connection.getRepository("RoleUser"));

/* GET home page. */
router.get('/', function (req, res, next) {
	const exec = Promise.all([roleService.getRoles(5), roleService.getRoles(4)]).then(data => data[0].concat(data[1]));
	Promise.all([
		Event.getFutureEvents(6),
		exec.then(function(roles) {
			return Promise.all(roles.map(async role => {
				const users = await Promise.all(role.roleUsers.map(ru => {
					return User.findByUsername(ru.username);
				}));
				role.users = users;
				return role;
			}));
		})
	]).then(function (data){
		res.render('home', {events: data[0], exec: data[1]});
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
router.use('/handbook/', handbook);
router.use('/services/', services);
router.use('/info/', info);
router.use('/support/', support);
router.use('/reps', reps);
router.use('/facilities/', facilities);
router.use('/tech/', tech);
router.use('/events/', events);
router.use('/welfare/', welfare);
router.use('/sportsandsocs/', sportsandsocs);
router.use('/mcr/', mcr);
router.use('/api/', api);

module.exports = router;
