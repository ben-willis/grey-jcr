var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../../tmp'});
var httpError = require('http-errors');
var httpError = require('http-errors');

import FileServiceImpl from "../../files/FileServiceImpl";
import { getConnection } from "typeorm";

const connection = getConnection("grey");

const fileService = new FileServiceImpl(connection.getRepository("File"), connection.getRepository("Folder"));

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
	fileService.createFolder(req.body.name, Number(req.body.folder)).then((folder) => {
		res.redirect(303, '/admin/files');
	}).catch(next);
});

router.get('/:folder_id/deletefolder/:subfolder_id', function (req, res, next) {
	fileService.deleteFileOrFolder("FOLDER", Number(req.params.subfolder_id)).then(() => {
		res.redirect(303, '/admin/files');
	}).catch(next);
});

router.post('/uploadfile', upload.single('file'), function (req, res, next) {
	fileService.uploadFile(
		req.body.name,
		req.file.path,
		req.file.mimetype,
		Number(req.body.folder),
		req.body.description,
	).then((file) => {
		res.redirect(303, '/admin/files');
	}).catch(next);
});

router.get('/:folder_id/deletefile/:file_id', function (req, res, next) {
	fileService.deleteFileOrFolder("FILE", Number(req.params.file_id)).then(() => {
		res.redirect(303, '/admin/files');
	}).catch(next);
});

module.exports = router;
