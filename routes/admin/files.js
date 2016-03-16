var express = require('express');
var router = express.Router();
var validator = require('validator');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');

/* GET files page. */
router.get('/', function (req, res, next) {
	res.render('admin/files');
});

router.post('/newfolder', function (req, res, next) {
	req.db.none('INSERT INTO file_directories(name, parent) VALUES ($1, $2)', [req.body.name, req.body.directory])
		.then(function () {
			res.redirect(303, '/admin/files');
		})
		.catch(function (err) {
			next(err);
		})
});

router.get('/deletefolder/:directory', function (req, res, next) {
	// Only delete if empty
	req.db.one('SELECT COUNT(*) AS files FROM files WHERE files.directoryid=$1', [req.params.directory])
		.then(function(count) {
			if (count.files > 0) {
				err = new Error("Directory must be empty")
				err.status = 400;
				return next(err);
			} else {
				return req.db.none('DELETE FROM file_directories WHERE id=$1', [req.params.directory]);
			}
		})
		.then(function (){
			res.redirect(303, '/admin/files');
		}).catch(function (err) {
			next(err);
		});
	
});

router.post('/uploadfile', upload.single('file'), function (req, res, next) {
	if (!req.file) {
		err = new Error("No file");
		return next(err);
	}
	var file_name = slugify(req.body.name)+"-"+makeid(5)+"."+mime.extension(req.file.mimetype);
	mv(req.file.path, __dirname+'/../../public/files/uploaded/'+file_name, function (err) {
		if (err) return next(err);
		req.db.none('INSERT INTO files(name, description, path, directoryid) VALUES ($1, $2, $3, $4)',[req.body.name, req.body.description, file_name, req.body.directory])
			.then(function (){
				res.redirect(303, '/admin/files');
			})
			.catch(function (err) {
				next(err);
			});
	});
});

router.get('/deletefile/:file', function (req, res, next) {
	req.db.none('DELETE FROM files WHERE id=$1', [req.params.file])
		.then(function (){
			res.redirect(303, '/admin/files');
		}).catch(function (err) {
			next(err);
		});
});

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function makeid(n)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = router;