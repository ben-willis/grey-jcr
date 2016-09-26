var express = require('express');
var router = express.Router();
var fs = require('fs');
var prettydate = require('pretty-date');
var treeize   = require('treeize');

var User = require('../models/user');
var Folder = require('../models/folder')

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

router.get('/events/:year/:month', function (req, res, next) {
	req.db.manyOrNone("SELECT id, name, slug, timestamp, description, image FROM events WHERE date_part('year', timestamp)=$1 AND date_part('month', timestamp)=$2", [req.params.year, req.params.month])
		.then(function (events) {
			return res.json(events);
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/blog', function (req, res, next) {
	var page = (req.query.page) ? parseInt(req.query.page) : 1;
	var amount = (req.query.length) ? parseInt(req.query.length) : 10;
	req.db.manyOrNone('SELECT (SELECT COUNT(*) FROM blog) AS total, users.name AS "data:author:name", users.username AS "data:author:username", positions.title AS "data:author:title", positions.slug AS "data:author:slug", blog.title AS "data:title", blog.slug AS "data:slug", blog.timestamp AS "data:timestamp", blog.message AS "data:message" FROM blog LEFT JOIN users ON blog.author=users.username LEFT JOIN positions ON blog.positionid=positions.id ORDER BY timestamp DESC LIMIT $1 OFFSET $2', [amount, (page-1) * amount])
		.then(function (data) {
			var blogTree = new treeize();
			blogTree.grow(data);
			var blog = blogTree.getData()[0];
			return res.json(blog);
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/blog/:positionslug', function (req, res, next) {
	var page = (req.query.page) ? parseInt(req.query.page) : 1;
	var amount = (req.query.length) ? parseInt(req.query.length) : 10;
	req.db.manyOrNone('SELECT (SELECT COUNT(*) FROM blog) AS total, users.name AS "data:author:name", users.username AS "data:author:username", positions.title AS "data:author:title", positions.slug AS "data:author:slug", blog.title AS "data:title", blog.slug AS "data:slug", blog.timestamp AS "data:timestamp", blog.message AS "data:message" FROM blog LEFT JOIN users ON blog.author=users.username LEFT JOIN positions ON blog.positionid=positions.id WHERE positions.slug=$3 ORDER BY timestamp DESC LIMIT $1 OFFSET $2', [amount, (page-1) * amount, req.params.positionslug])
		.then(function (data) {
			var blogTree = new treeize();
			blogTree.grow(data);
			var blog = blogTree.getData()[0];
			return res.json(blog);
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/positions/:id', function (req, res, next) {
	req.db.one("SELECT title, description FROM positions WHERE id=$1", req.params.id)
		.then(function (position) {
			if (!position.description) {
				position.description = "No Description"
			}
			return res.json(position);
		}).catch(function (err) {
			return res.json(err);
		});
});

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
		res.json({"current": current_folder, "directories": data[0], "files": data[1]});
	}).catch(function (err) {
		res.json(err);
	});
});

var feedback = require('./api/feedback')
router.use('/feedback', feedback);
router.use('/poll', require('./api/poll'));


module.exports = router;
