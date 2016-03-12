var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET blog page. */
router.get('/', function (req, res, next) {
	req.db.many('SELECT blog.id, blog.title, blog.message, blog.timestamp, positions.title AS position FROM blog LEFT JOIN positions ON positions.id=blog.positionid WHERE blog.author=$1 ORDER BY timestamp DESC', req.user.username)
		.then(function (posts) {
			res.render('admin/blog', {posts: posts});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new blog */
router.post('/new', function (req, res, next) {
	req.db.none('INSERT INTO blog(title, author, positionid, message, slug) VALUES ($1, $2, $3, $4, $5)',[req.body.title, req.user.username, req.body.position, req.body.message, slugify(req.body.title)])
		.then(function (){
			res.redirect('/admin/blog')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET edit blog page. */
router.get('/:postid/edit', function (req, res, next) {
	req.db.one('SELECT blog.id, blog.title, blog.message FROM blog WHERE blog.id=$1', req.params.postid)
		.then(function (post) {
			res.render('admin/blog_edit', {post: post});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST and update to a blog */
router.post('/:postid/edit', function (req, res, next) {
	req.db.none('UPDATE blog SET title=$1, message=$2 WHERE id=$3', [req.body.title, req.body.message, req.params.postid])
		.then(function () {
			res.redirect('/admin/blog')
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET a delete blog post */
router.get('/:postid/delete', function (req, res, next) {
	req.db.none("DELETE FROM blog WHERE id=$1", req.params.postid)
		.then(function () {
			res.redirect('/admin/blog');
		})
		.catch(function (err) {
			next(err);
		})
})

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

module.exports = router;
