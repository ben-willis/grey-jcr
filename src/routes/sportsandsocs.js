var express = require('express');
var models = require('../models');
var router = express.Router();

/* GET home page. */
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
		return res.render('sportsandsocs/index', {societies: data[0], sports: data[1]});
	}).catch(next);
});

router.get('/:society_slug', function(req, res, next) {
	var societyPromise = models.society.findOne({
		where: {
			slug: req.params.society_slug
		}
	});
	var othersPromise = societyPromise.then(function(society) {
		return models.society.findAll({
			where: {
				type: society.type
			}
		});
	}).then(function(others) {
		return shuffle(others).slice(0,4);
	});

	Promise.all([societyPromise, othersPromise]).then(function([society, others]) {
		res.render('sportsandsocs/society', {society: society, others: others});
	}).catch(next);
});

module.exports = router;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
