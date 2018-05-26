/* REQUIREMENTS*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var io = require('socket.io')(8082);
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var LocalStrategy = require('passport-local').Strategy;
var https = require('https');
var compress = require('compression');
var helmet = require('helmet');

var routes = require('./routes/index');
var admin = require('./routes/admin/index');

var app = express();

/* SET UP */
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var models = require('./models');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    store: new RedisStore({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 14*24*60*60*1000}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

/* PASSPORT */
passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    var userPromise = models.user.findById(username, {include: [models.debt]});
    var rolesPromise = userPromise.then(function(user) {
        return user.getRoles({include: [models.folder]});
    });

    Promise.all([userPromise, rolesPromise]).then(function([user, roles]){
        user.level = Math.max(...roles.map((role) => role.level));
        user.roles = roles;
        user.debt = user.debts.reduce((a,b) => a.amount + b.amount, 0);
        done(null, user);
    }).catch(done);
});

passport.use(new LocalStrategy( function (username, password, done) {
    // Check username and password are set
    if (!password || !username) return done(null, false);
    var username = username.toLowerCase();

    models.user.authenticate(username, password).then(function(authenticated) {
        if (!authenticated) return done(null, false);
        return models.user.count({where: {username: username}});
    }).then(function(count) {
        if (count > 0) return models.user.findById(username);
        return models.user.fetchDetails(username).then(function(details) {
            return models.user.create({
                username: username,
                email: details.email,
                name: details.full_name
            });
        });
    }).then(function(user) {
        done(null, user);
    }).catch(done);
}));

/* PUG */
var prettydate = require('pretty-date');
app.use(function (req, res, next) {
  res.locals.user = req.user;
  res.locals.query = req.query;
  res.locals.prettydate = prettydate;
  next();
});

/* ROUTING AND ERRORS */
app.use('/', routes);
app.use('/admin/', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
    console.error(err)
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

module.exports = app;
