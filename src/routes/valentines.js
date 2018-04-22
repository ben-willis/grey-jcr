var express = require('express');
var router = express.Router();
var io = require('../helpers/socketApi.js').io;
var httpError = require('http-errors');

var models = require('../models/models')

router.use(function (req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.session.redirect_to = req.originalUrl;
		res.redirect(401, '/login?unauthorised');
	}
});

function max(a,b) {
	return (a>b) ? a : b;
}

/* GET swapping page */
router.get('/', function (req, res, next) {
	Promise.all([
		models.valentines_pair.findAll(),
		models.valentines_swap.findAll(),
		models.valentines_status.findOne()
	]).then(function([pairs, swaps, status]){
		res.render('events/valentines', {
			pairs: pairs,
			swaps: swaps.slice(0,5),
			debt: swaps.filter((swap) => (swap.username == req.user.username)).reduce((a, b) => a.cost + b.cost, 0),
			total: swaps.reduce((a, b) => a.cost + b.cost, 0),
			swapping_open: status.open
		});
	}).catch(next);
});

router.get('/stats.json', function(req,res, next) {
	models.valentines_swap.sum("cost").then(function(total){
		res.json({
			"totalRaised": total
		});
	}).catch(next);
});

/* Post a swap */
router.post('/', function (req, res, next) {
	models.valentines_status.findOne(function(status) {
		if (!status.open) return next(httpError(400, 'Swapping is Closed'));

		var swap = await Promise.all([
			models.valentines_pair.findById(req.body.pairA),
			models.valentines_pair.findById(req.body.pairB)
		]).then(function([pairA, pairB]) {
			var aPosition = pairA.position;
			var bPosition = pairB.position;
			return Promise.all([
				pairA.update({position: bPosition, value: pairA.value + 50}),
				pairB.update({position: aPosition, value: pairB.value + 50})
			]);
		}).then(function([newPairA, newPairB]) {
			return models.valentines_swap.create({
				paira: newPairA.id,
				pairb: newPairB.id,
				username: req.user.username,
				cost: Math.max(newPairA.value - 50, newPairB.value - 50)
			});
		});

		io.emit('swap', swap.toJSON());
		res.redirect(303, '/events/valentines');
	}).catch(next);
});

module.exports = router;