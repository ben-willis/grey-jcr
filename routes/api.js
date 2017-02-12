var express = require('express');
var router = express.Router();
var fs = require('fs');
var prettydate = require('pretty-date');
var treeize   = require('treeize');
var httpError = require('http-errors');

var User = require('../models/user');
var Folder = require('../models/folder')
var Role = require('../models/role');
var Event = require('../models/event');
var Blog = require('../models/blog');
var Election = require('../models/election');
var Feedback = require('../models/feedback');

// The main site search
router.get('/search/', function (req, res, next) {
	Promise.all([
		User.search(req.query.q),
		Blog.search(req.query.q),
		Event.search(req.query.q)
	]).then(function(data) {
		users = data[0].map(function(user) {
			return {
				title: user.name,
				url: '/services/user/'+user.username,
				description: user.username
			}
		})
		blogs = data[1].map(function(blog) {
			return {
				title: blog.title,
				url: '/jcr/blog/'+blog.role.slug+'/'+blog.updated.getFullYear()+"/"+(blog.updated.getMonth()+1)+"/"+blog.updated.getDate()+"/"+blog.slug,
				description: prettydate.format(blog.updated)
			}
		})
		events = data[2].map(function(event) {
			return {
				title: event.name,
				url: "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug,
				description: event.time.toDateString()
			}
		})
		return res.json({
			results: {
				users: {name: "Grey College Members", results: users},
				blogs: {name: "Blog Posts", results: blogs},
				events: {name: "Upcoming Events", results: events}
			}
		});
	}).catch( function (err) {
		next(err);
	})

});

// Needed for the calendar
router.get('/events/:year/:month', function (req, res, next) {
	Event.getByMonth(req.params.year, req.params.month).then(function (events) {
			res.json(events);
		}).catch(function (err) {
			next(err);
		});
});

// Needed for JCR, welfare and support page
router.get('/roles/:role_id', function(req, res, next) {
	Role.findById(req.params.role_id).then(function(role) {
		res.json(role);
	}).catch(function (err) {
		next(err);
	});
})

// Needed for adding users to roles etc
router.get('/users', function (req, res, next) {
	User.search(req.query.q)
		.then(function (users) {
			res.json({success: true, users: users});
		}).catch(function (err) {
			next(err);
		});
});

router.get('/users/:username/avatar', function (req, res, next) {
	fs.access(__dirname+'/../public/images/avatars/'+req.params.username+'.png', function (err) {
		if (!err) {
			res.sendFile('public/images/avatars/'+req.params.username+'.png', {
    			root: __dirname+'/../'
    		});
		} else {
			res.sendFile('public/images/avatars/anon.png', {
    			root: __dirname+'/../'
    		});
		}
	});

});

router.get('/files/:folder_id', function (req, res, next) {
	var current_folder = null;
	Folder.findById(parseInt(req.params.folder_id)).then(function(folder) {
		current_folder = folder;
		return Promise.all([
			current_folder.getSubfolders(),
			current_folder.getFiles()
		])
	}).then(function (data) {
		res.json({"current": current_folder, "folders": data[0], "files": data[1]});
	}).catch(function (err) {
		next(err);
	});
});

// Needed for menu notifications
router.get('/elections/:status', function(req,res,next) {
	if (!req.user) return res.json({"error": "You must be logged in"});
	Election.getByStatus(req.params.status).then(function(elections) {
		return Promise.all(
			elections.map(function(election) {
				return User.findByUsername(req.user.username).then(function(user) {
					return user.getVote(election.id);
				}).then(function(votes) {
					if (votes) {
						election.voted = true;
					} else {
						election.voted = false;
					}
					return election;
				})
			})
		)
	}).then(function(elections) {
		res.json(elections);
	}).catch(function (err) {
		next(err);
	});
});

router.get('/blogs/unread', function(req, res, next) {
	if (!req.user) return next(httpError(401));
	Blog.getByDateRange(req.user.last_login, new Date()).then(function(blogs) {
		res.json(blogs);
	}).catch(function (err) {
		next(err);
	});
})

router.get('/feedbacks', function(req, res, next) {
	if (!req.user) return res.json({"error": "You must be logged in"});
	Feedback.getAllByUser(req.user.username).then(function(feedbacks) {
		res.json(feedbacks);
	}).catch(function (err) {
		next(err);
	});
})

router.use(function(err, req, res, next) {
	error_status = err.status || 500;
	return res.status(error_status).json({
		status: error_status,
		message: err.message
	});
})

module.exports = router;
