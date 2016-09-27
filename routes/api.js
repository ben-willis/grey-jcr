var express = require('express');
var router = express.Router();
var fs = require('fs');
var prettydate = require('pretty-date');
var treeize   = require('treeize');

var User = require('../models/user');
var Folder = require('../models/folder')
var Position = require('../models/position')

// The main site search
router.get('/search/', function (req, res, next) {
	var query = '%'+req.query.q+'%';
	var data = {
		results: {}
	};
	req.db.manyOrNone("SELECT blog.id, blog.title, blog.slug, blog.timestamp, positions.slug AS position_slug FROM blog LEFT JOIN positions ON blog.positionid=positions.id WHERE LOWER(blog.title) LIKE LOWER($1) ORDER BY blog.timestamp DESC", [query])
		.then(function (blogPosts) {
			if (blogPosts.length != 0) {
				data.results.blog = {
					name: 'Blog Posts',
					results: []
				}
				for (var i = 0; i < blogPosts.length; i++) {
					data.results.blog.results.push({
						title: blogPosts[i].title,
						url: '/jcr/blog/'+blogPosts[i].position_slug+'/'+blogPosts[i].timestamp.getFullYear()+'/'+(blogPosts[i].timestamp.getMonth()+1)+'/'+blogPosts[i].slug,
						description: prettydate.format(blogPosts[i].timestamp)
					});
				};
			}
			return req.db.manyOrNone("SELECT name, timestamp, image, slug FROM events WHERE LOWER(name) LIKE LOWER($1) AND timestamp>NOW() ORDER BY timestamp ASC", [query]);
		})
		.then(function (events) {
			if (events.length != 0) {
				data.results.events = {
					name: 'Upcoming Events',
					results: []
				}
				for (var i = 0; i < events.length; i++) {
					data.results.events.results.push({
						title: events[i].name,
						// image: '/images/events/'+events[i].image,
						url: "/events/"+events[i].timestamp.getFullYear()+"/"+(events[i].timestamp.getMonth()+1)+"/"+(events[i].timestamp.getDate())+"/"+events[i].slug,
						description: events[i].timestamp.toDateString()
					});
				};
			}
			if (!req.isAuthenticated()) {
				return res.json(data);
			}
			return User.searchByName(query);
		})
		.then(function (users) {
			if(users.length != 0) {
				data.results.users = {
					name: 'Grey College Members',
					results: []
				}
				for (var i = 0; i < users.length; i++) {
					data.results.users.results.push({
						title: users[i].name,
						// image: '/api/users/'+users[i].username+'/avatar',
						url: '/services/user/'+users[i].username,
						description: users[i].username
					});
				};
			}
			return res.json(data);
		})
		.catch( function (err) {
			return res.json(err);
		})
});

// Needed for the calendar
router.get('/events/:year/:month', function (req, res, next) {
	req.db.manyOrNone("SELECT id, name, slug, timestamp, description, image FROM events WHERE date_part('year', timestamp)=$1 AND date_part('month', timestamp)=$2", [req.params.year, req.params.month])
		.then(function (events) {
			return res.json(events);
		}).catch(function (err) {
			return res.json(err);
		});
});

// Needed for JCR, welfare and support page
router.get('/positions/:position_id', function(req, res, next) {
	Position.findById(req.params.position_id).then(function(position) {
		res.json(position);
	}).catch(function (err) {
		res.json(err);
	});
})

// Needed for adding users to positions etc
router.get('/users', function (req, res, next) {
	User.search(req.query.q)
		.then(function (users) {
			res.json({success: true, users: users});
		}).catch(function (err) {
			res.json(err);
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
		res.json(err);
	});
});


module.exports = router;
