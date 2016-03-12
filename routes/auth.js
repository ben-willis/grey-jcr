var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.post('/login', passport.authenticate('local', { failureRedirect: '/login?failure', failureFlash: true}), function (req, res) {
	var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
	delete req.session.redirect_to;
	res.redirect(redirect_to);
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
