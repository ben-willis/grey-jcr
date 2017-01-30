var express = require('express');
var router = express.Router();
var httpError = require('http-errors');

var valentines = require('../models/valentines')

router.use(function (req, res, next) {
	valentines.getStatus().then(function(status){
		valentines.open = status;

		if (req.isAuthenticated()) {
			next();
		} else {
			req.session.redirect_to = req.originalUrl;
			res.redirect(401, '/login?unauthorised');
		}
	})
	
});

function max(a,b) {
	return (a>b) ? a : b;
}

/* GET swapping page */
router.get('/', function (req, res, next) {
	Promise.all([
		valentines.getPairs(),
		valentines.getSwaps(5),
		valentines.getDebt(req.user.username),
		valentines.getTotalRaised()
	]).then(function(data){
		res.render('events/valentines', {
			pairs: data[0],
			swaps: data[1],
			debt: data[2],
			total: data[3],
			swapping_open: valentines.open
		})
	}).catch(function(err){
		next(err)
	})
});

router.get('/stats.json', function(req,res, next) {
	valentines.getTotalRaised().then(function(total){
		res.json({
			"totalRaised": total
		})
	}).catch(function(err){
		next(err)
	})
})

/* Post a swap */
router.post('/', function (req, res, next) {
	if (!valentines.open) return next(httpError(400, 'Swapping is Closed'));

	var pairA = parseInt(req.body.pairA);
	var pairB = parseInt(req.body.pairB);
	var swap_cost = 0;

	valentines.swapPairs(pairA, pairB).then(function(data) {
		var pairA_cost = data.rows[0].value - 50
		var pairB_cost = data.rows[1].value - 50
		swap_cost = (pairA_cost > pairB_cost) ? pairA_cost : pairB_cost;
		return valentines.createSwap(pairA, pairB, req.user.username, swap_cost)
	}).then(function() {
		req.io.emit('swap', {paira: pairA, pairb: pairB, cost: swap_cost});
		res.redirect(303, '/events/valentines');
	}).catch(function(err) {
		next(err);
	})
})

module.exports = router;