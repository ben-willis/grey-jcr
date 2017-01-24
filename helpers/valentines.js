var db = require('../helpers/db');
var httpError = require('http-errors');

var Valentines = function() {
	return null;
}

Valentines.getPairs = function() {
	return db('valentines_pairs').select();
};

Valentines.getSwaps = function() {
	return db('valentines_swaps').select();
}

module.exports = Valentines