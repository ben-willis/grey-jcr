var express = require('express');
var router = express.Router();

var Society = require('../../models/society');

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
		Society.getByType('society').then(function(society_data){
			return society_data.map(function(data){ return new Society(data) });
		}),
		Society.getByType('sport').then(function(sport_data){
			return sport_data.map(function(data){ return new Society(data) });
		})
	]).then(function (data) {
		return res.render('admin/societies', {societies: data[0], sports: data[1]});
	}).catch(function (err) {
		return next(err);
	});
});

/* POST a new society */
router.post('/', function (req, res, next) {
	Society.create(req.body.name, req.body.type).then(function (society){
		return res.redirect('/admin/societies/'+society.id)
	}).catch(function (err) {
		return next(err);
	});
});

/* GET edit society page. */
router.get('/:society_id', function (req, res, next) {
	Society.findById(parseInt(req.params.society_id)).then(function (society) {
		return res.render('admin/society_edit', {society: society});
	}).catch(function (err) {
		return next(err);
	});
});

/* POST and update to a society */
router.post('/:society_id', function (req, res, next) {
	Society.findById(parseInt(req.params.society_id)).then(function (society) {
		return society.update(
			req.body.name,
			req.body.description,
			req.body.facebook,
			req.body.twitter,
			req.body.email,
			req.body.type
		)
	}).then(function () {
		return res.redirect('/admin/societies')
	}).catch(function (err) {
		return next(err);
	});
});

/* GET a delete society post */
router.get('/:society_id/delete', function (req, res, next) {
	Society.findById(parseInt(req.params.society_id)).then(function (society) {
		return society.delete()
	}).then(function () {
		return res.redirect('/admin/societies')
	}).catch(function (err) {
		return next(err);
	});
})

module.exports = router;