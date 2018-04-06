var express = require('express');
var htmlToText = require('html-to-text');
var router = express.Router();

var Society = require('../models/society');

/* GET home page. */
router.get('/', function (req, res, next) {
	Promise.all([
		Society.getByType('society').then(function(society_data){
			return society_data.map(function(data){
				data.description = htmlToText.fromString(data.description, {
					wordwrap: false,
					ignoreHref: true,
					ignoreImage: true
				}).slice(0, 100) + "...";
				return new Society(data);
			});
		}),
		Society.getByType('sport').then(function(sport_data){
			return sport_data.map(function(data){
				data.description = htmlToText.fromString(data.description, {
					wordwrap: false,
					ignoreHref: true,
					ignoreImage: true
				}).slice(0, 100) + "...";
				return new Society(data);
			});
		})
	]).then(function (data) {
		return res.render('sportsandsocs/index', {societies: data[0], sports: data[1]});
	}).catch(function (err) {
		return next(err);
	});
});

router.get('/:society_slug', function(req, res, next) {
	var society;
	Society.findBySlug(req.params.society_slug).then(function(data) {
		society = data;
		var type = (data.type === 0) ? "society" : "sport";
		return Society.getByType(type);
	}).then(function(other_societies) {
		other_societies = shuffle(other_societies);
		res.render('sportsandsocs/society', {society: society, others: other_societies.slice(0,4)});
	}).catch(function(err) {
		next(err);
	});
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