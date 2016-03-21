var express = require('express');
var router = express.Router();
var fs = require('fs');
var prettydate = require('pretty-date');

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
						url: '/events/'+events[i].timestamp.getFullYear()+'/'+(events[i].timestamp.getMonth()+1)+'/'+events[i].slug,
						description: events[i].timestamp.toDateString()
					});
				};
			}
			if (!req.isAuthenticated()) {
				return res.json(data);
			}
			return req.db.manyOrNone("SELECT name, username FROM users WHERE LOWER(name) LIKE LOWER($1)", [query]);			
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
						url: '/services/users/'+users[i].username,
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
	req.db.one("SELECT id, name, slug, description, image AS positions_slug FROM events WHERE date_part('year', blog.timestamp)=$1 AND date_part('month', blog.timestamp)=$2", req.params.id)
		.then(function (position) {
			if (!position.description) {
				position.description = "No Description"
			}
			return res.json(position);
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
	var query = '%'+req.query.q+'%';
	req.db.manyOrNone('SELECT * FROM users WHERE LOWER(username) LIKE LOWER($1) OR LOWER(name) LIKE LOWER($1)', query)
		.then(function (users) {
			return res.json({success: true, users: users});
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/users/:username', function (req, res, next) {
	req.db.one("SELECT * FROM users WHERE username='"+req.params.username+"'")
		.then(function (user) {
			return res.json(user);
		}).catch(function (err) {
			return res.json(err);
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

router.get('/files/:directoryid', function (req, res, next) {
	var current
	var files;
	var directories;
	req.db.one("SELECT name, id, parent FROM file_directories WHERE id=$1", [req.params.directoryid])
		.then(function (data){
			current = data;
			return req.db.manyOrNone("SELECT id, timestamp, name, path, description FROM files WHERE directoryid=$1", [req.params.directoryid])
		})
		.then(function (data) {
			files = data;
			return req.db.manyOrNone("SELECT name, id FROM file_directories WHERE parent=$1", [req.params.directoryid]);
		})
		.then(function (data) {
			directories = data;
			res.json({"current": current,"directories": directories, "files": files});
		})
		.catch(function (err) {
			res.json(err);
		});
});

module.exports = router;