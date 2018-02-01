var express = require('express');
var router = express.Router();

/* GET the menus page */
router.get('/menus', function (req, res, next){
	start = new Date(2018, 1-1, 15);
	now = new Date();
	week = 7*24*60*60*1000;
	currWeek = (req.query.week) ? parseInt(req.query.week) : Math.floor((now-start)/week) + 1;
	res.render('info/menus', {week: currWeek});
});

/* GET the trust page */
router.get('/trust', function (req, res, next){
	res.render('info/trust');
});

module.exports = router;
