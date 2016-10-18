var express = require('express');
var router = express.Router();
var validator = require('validator');
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var httpError = require('http-errors');
var slug = require('slug');
var shortid = require('shortid');
var httpError = require('http-errors');

var Folder = require('../../models/folder');

router.use(function (req, res, next) {
	if (req.user.level < 4) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET files page. */
router.get('/', function (req, res, next) {
	res.render('admin/files');
});

router.post('/newfolder', function (req, res, next) {
	Folder.findById(parseInt(req.body.folder)).then(function(folder){
		folder.createSubfolder(req.body.name)
	}).then(function () {
		res.redirect(303, '/admin/files');
	}).catch(function (err) {
		next(err);
	});
});

router.get('/:folder_id/deletefolder/:subfolder_id', function (req, res, next) {
	Folder.findById(parseInt(req.params.folder_id)).then(function(folder){
		return folder.removeSubfolder(parseInt(req.params.subfolder_id));
	}).then(function () {
		res.redirect(303, '/admin/files');
	}).catch(function (err) {
		next(err);
	});
});

router.post('/uploadfile', upload.single('file'), function (req, res, next) {
	var current_folder = null;
	Folder.findById(parseInt(req.body.folder)).then(function(folder){
		current_folder = folder;
		return new Promise(function(resolve, reject) {
			if (!req.file) return reject(httpError(400, "No file submitted"));
			var file_name = slug(req.body.name)+"-"+shortid.generate()+"."+mime.extension(req.file.mimetype);
			mv(req.file.path, __dirname+'/../../public/files/uploaded/'+file_name, function (err) {
				if(err) return reject(err);
				return resolve(file_name);
			})
		});
	}).then(function(file_name) {
		return current_folder.createFile(req.body.name, req.body.description, file_name);
	}).then(function (){
		res.redirect(303, '/admin/files');
	}).catch(function (err) {
		next(err);
	});
});

router.get('/:folder_id/deletefile/:file_id', function (req, res, next) {
	Folder.findById(parseInt(req.params.folder_id)).then(function(folder){
		return folder.removeFile(parseInt(req.params.file_id))
	}).then(function () {
		res.redirect(303, '/admin/files');
	}).catch(function (err) {
		next(err);
	});
});

module.exports = router;
