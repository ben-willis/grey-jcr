var express = require('express');
var router = express.Router();
var fs = require('fs');
var prettydate = require('pretty-date');
var httpError = require('http-errors');

const Op = require("sequelize").Op;

var models = require("../models");

// The main site search
router.get('/search/', function (req, res, next) {
	Promise.all([
		models.user.findAll({
			where: {
				[Op.or]: [{
					username: { [Op.iLike]: req.query.q }
				},
				{
					name: { [Op.iLike]: req.query.q }
				}]
			}
		}),
		models.blog.findAll({
			where: {
				name: { [Op.iLike]: req.query.q }
			},
			include: [models.role]
		}),
		models.event.findAll({
			where: {
				name: { [Op.iLike]: req.query.q }
			},
			include: [models.role]
		})
	]).then(function(data) {
		var users = data[0].map(function(user) {
			return {
				title: user.name,
				url: '/services/user/'+user.username,
				description: user.username
			};
		});
		var blogs = data[1].map(function(blog) {
			return {
				title: blog.title,
				url: '/jcr/blog/'+blog.role.slug+'/'+blog.updated.getFullYear()+"/"+(blog.updated.getMonth()+1)+"/"+blog.updated.getDate()+"/"+blog.slug,
				description: prettydate.format(blog.updated)
			};
		});
		var events = data[2].map(function(event) {
			return {
				title: event.name,
				url: "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug,
				description: event.time.toDateString()
			};
		});
		return res.json({
			results: {
				users: {name: "Grey College Members", results: users},
				blogs: {name: "Blog Posts", results: blogs},
				events: {name: "Upcoming Events", results: events}
			}
		});
	}).catch(next);

});

// Needed for the calendar
router.get('/events/:year/:month', function (req, res, next) {
	models.event.findAll({
		where: {
			time: {
				[Op.between]: [new Date(req.params.year, req.params - 1), new Date(req.params.year, req.params)]
			}
		}
	}).then(function (events) {
		res.json(events.toJSON());
	}).catch(next);
});

// Needed for JCR, welfare and support page
router.get('/roles/:role_id', function(req, res, next) {
	models.role.findById(req.params.role_id).then(function(role) {
		res.json(role.toJSON());
	}).catch(next);
});

// Needed for adding users to roles etc
router.get('/users', function (req, res, next) {
	models.user.findAll({
		where: {
			[Op.or]: [{
				username: { [Op.iLike]: req.query.q }
			},
			{
				name: { [Op.iLike]: req.query.q }
			}]
		}
	}).then(function (users) {
		res.json({success: true, users: users.toJSON()});
	}).catch(next);
});

router.get('/users/:username/avatar', function (req, res, next) {
	fs.access(__dirname+'/../public/files/avatars/'+req.params.username+'.png', function (err) {
		if (!err) {
			res.sendFile('public/files/avatars/'+req.params.username+'.png', {
  			root: __dirname+'/../'
  		});
		} else {
			res.sendFile('public/images/anon.png', {
  			root: __dirname+'/../'
  		});
		}
	});

});

router.get('/files/:folder_id', function (req, res, next) {
	var currentFolderPromise = models.folder.findById(req.params.folder_id);

	var childrenPromise = currentFolderPromise.then(function(currentFolder) {
		return Promise.all([
			models.folder.findAll({where: {parent_id: currentFolder.id}}),
			models.file.findAll({where: {folder_id: currentFolder.id}})
		]);
	});

	Promise.all([currentFolderPromise, childrenPromise]).then(function([currentFolder, children]) {
		res.json({
			"current": currentFolder.toJSON(),
			"folders": children[0].map(x => x.toJSON()),
			"files": children[1].map(x => x.toJSON())
		});
	}).catch(next);
});

// Needed for menu notifications
router.get('/elections/:status', function(req,res,next) {
	if (!req.user) return res.json({"error": "You must be logged in"});

	models.election.findAll({
		where: {
			status: req.params.status
		},
		include: [{
			model: models.election_vote,
			where: {
				username: req.user.username
			}
		}]
	}).then(function(rawElections) {
		var elections = rawElections.map((election) => {
			election.voted = (election.votes.length == 0);
			return election;
		});
		res.json(elections.toJSON());
	}).catch(next);
});

router.get('/blogs/unread', function(req, res, next) {
	if (!req.user) return next(httpError(401));
	models.blog.findAll({
		where: {
			updated: {
				[Op.between]: [req.user.last_login, new Date()]
			}
		}
	}).then(function(blogs) {
		res.json(blogs.toJSON);
	}).catch(next);
});

router.get('/feedbacks', function(req, res, next) {
	if (!req.user) return res.json({"error": "You must be logged in"});
	models.Feedback.findAll({where: {author: req.user.username}}).then(function(feedbacks) {
		res.json({
			feedbacks: feedbacks.map(x => x.toJSON())
		});
	}).catch(next);
});

router.use(function(err, req, res, next) {
	var error_status = err.status || 500;
	return res.status(error_status).json({
		status: error_status,
		message: err.message
	});
});

module.exports = router;
