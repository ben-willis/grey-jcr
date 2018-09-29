var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../../tmp'});
var mv = require('mv');
var mime = require('mime');
var httpError = require('http-errors');
var slug = require('slug');
var shortid = require('shortid');
var httpError = require('http-errors');

var models = require('../../models');

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
	models.folder.findById(req.body.folder).then(function(parentFolder){
		return models.folder.create({
			name: req.body.name,
			parent_id: parentFolder.id
		});
	}).then(function () {
		res.redirect(303, '/admin/files');
	}).catch(next);
});

router.get('/:folder_id/deletefolder/:subfolder_id', function (req, res, next) {
	models.folder.findById(req.params.subfolder_id).then(function(folder){
		return folder.destroy();
	}).then(function () {
		res.redirect(303, '/admin/files');
	}).catch(next);
});

router.post('/uploadfile', upload.single('file'), function (req, res, next) {
	var fileUploadPromise = new Promise(function(resolve, reject) {
			if (!req.file) return reject(httpError(400, "No file submitted"));
			var fileName = slug(req.body.name)+"-"+shortid.generate()+"."+mime.extension(req.file.mimetype);
			mv(req.file.path, __dirname+'/../../public/files/uploaded/'+fileName, function (err) {
				if(err) return reject(err);
				return resolve(fileName);
			});
		});

	var folderPromise = models.folder.findById(req.body.folder);

	Promise.all([folderPromise, fileUploadPromise]).then(function([folder, fileName]){
		return models.file.create({
			name: req.body.name,
			description: req.body.description,
			folder_id: folder.id,
			path: fileName
		});
	}).then(function (){
		res.redirect(303, '/admin/files');
	}).catch(next);
});

router.get('/:folder_id/deletefile/:file_id', function (req, res, next) {
	models.file.findById(req.params.file_id).then(function(file) {
		return file.destroy();
	}).then(function () {
		res.redirect(303, '/admin/files');
	}).catch(next);
});

module.exports = router;
