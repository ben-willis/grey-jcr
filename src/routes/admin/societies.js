var express = require('express');
var models = require('../../models');
var slugify = require('slug');
var router = express.Router();

router.use(function (req, res, next) {
	if (req.user.level < 4) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET societies page. */
router.get('/', function (req, res, next) {
	Promise.all([
		models.society.findAll({
			where: {
				type: 0
			}
		}),
		models.society.findAll({
			where: {
				type: 1
			}
		})
	]).then(function (data) {
		return res.render('admin/societies', {societies: data[0], sports: data[1]});
	}).catch(next);
});

/* POST a new society */
router.post('/', function (req, res, next) {
	models.society.create({
		name: req.body.name,
		slug: slugify(req.body.name),
		type: req.body.type
	}).then(function (society){
		return res.redirect('/admin/societies/'+society.id);
	}).catch(next);
});

/* GET edit society page. */
router.get('/:society_id', function (req, res, next) {
	models.society.findById(parseInt(req.params.society_id)).then(function (society) {
		return res.render('admin/society_edit', {society: society});
	}).catch(next);
});

/* POST and update to a society */
router.post('/:society_id', function (req, res, next) {
	models.society.findById(parseInt(req.params.society_id)).then(function (society) {
		return society.update({
			name: req.body.name,
			slug: slugify(req.body.name),
			description: req.body.description,
			facebook: (req.body.facebook) ? req.body.facebook : null,
			twitter: (req.body.twitter) ? req.body.twitter: null,
			email: (req.body.email) ? req.body.email : null,
			type: req.body.type
		});
	}).then(function () {
		return res.redirect('/admin/societies');
	}).catch(next);
});

/* GET a delete society post */
router.get('/:society_id/delete', function (req, res, next) {
	models.society.findById(parseInt(req.params.society_id)).then(function (society) {
		return society.destroy();
	}).then(function () {
		return res.redirect('/admin/societies');
	}).catch(next);
});

module.exports = router;