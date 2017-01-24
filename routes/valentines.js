var express = require('express');
var router = express.Router();
var httpError = require('http-errors');
var io = require('socket.io')(8081);

var db = require('../helpers/db');

router.use(function (req, res, next) {
	if (req.isAuthenticated()) {
		req.io = io;
		next();
	} else {
		req.session.redirect_to = req.originalUrl;
		res.redirect(401, '/login?unauthorised');
	}
});

function max(a,b) {
	return (a>b) ? a : b;
}

function getPairs() {
	return db('valentines_pairs').select().orderBy('position', 'ASC')
}

function getSwaps(limit) {
	return db('valentines_swaps').select().limit(limit).orderBy('created', 'DESC').then(function(swaps){
		return Promise.all(swaps.map(function(swap) {
			return Promise.all([
				swap,
				db('valentines_pairs').first().where({id: swap.paira_id}),
				db('valentines_pairs').first().where({id: swap.pairb_id})
			]).then(function(data) {
				var newswap = data[0]
				newswap.paira = data[1]
				newswap.pairb = data[2]
				return newswap
			})
		}))
	})
}

function swapPositions(paira_id, pairb_id) {
	// I'm not proud of this query but it swaps the position of two pairs and updates their values
	return db.raw('UPDATE valentines_pairs vp1 SET position = vp2.position, value = vp2.value+50 FROM valentines_pairs vp2 WHERE vp1.id IN(?,?) AND vp2.id IN(?,?) AND vp1.id<>vp2.id RETURNING vp1.id, vp1.value', [paira_id, pairb_id, paira_id, pairb_id])
}

// 

function createSwap(paira_id, pairb_id, username, value) {
	return db('valentines_swaps').insert({
		paira_id: paira_id,
		pairb_id: pairb_id,
		username: username,
		cost: value
	})
}

function getDebt(username) {
	return db('valentines_swaps').sum('cost').where('username', username).first();
}

function getTotal() {
	return db('valentines_swaps').sum('cost').first();
}

/* GET swapping page */
router.get('/', function (req, res, next) {
	Promise.all([
		getPairs(),
		getSwaps(5),
		getDebt(req.user.username),
		getTotal()
	]).then(function(data){
		console.log(data[3])
		res.render('events/valentines', {
			pairs: data[0],
			swaps: data[1],
			debt: data[2].sum,
			total: data[3].sum
		})
	})
});

/* Post a swap */
router.post('/', function (req, res, next) {
	pairA = parseInt(req.body.pairA);
	pairB = parseInt(req.body.pairB);

	swapPositions(pairA, pairB).then(function(data) {
		console.log(data)
		pairA_cost = data.rows[0].value - 50
		pairB_cost = data.rows[1].value - 50
		return createSwap(pairA, pairB, req.user.username, max(pairA_cost, pairB_cost))
	}).then(function() {
		req.io.emit('swap', {paira: pairA, pairb: pairB, cost: max(pairA_cost, pairB_cost)});
		res.redirect(303, '/events/valentines');
	}).catch(function(err) {
		next(err);
	})
})

module.exports = router;