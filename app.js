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
var FileStore = require('session-file-store')(session);
var LocalStrategy = require('passport-local').Strategy;
var https = require('https');
var compress = require('compression');
var helmet = require('helmet');

var routes = require('./routes/index');
var admin = require('./routes/admin/index');

var app = express();

/* SET UP */
require('dotenv').config();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var User = require('./models/user');
var Folder = require('./models/folder')

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    store: new FileStore(),
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
    var current_user = null;
    User.findByUsername(username).then(function(user){
        current_user = user;
        return current_user.getRoles();
    }).then(function(roles) {
        return Promise.all(
            roles.map(function(role) {
                return Folder.findForRole(role.id).then(function(folder) {
                    role.folder = folder;
                    return role;
                });
            })
        )
    }).then(function(roles) {
        current_user.level = 0;
        for (var i = 0; i < roles.length; i++) {
            if (roles[i].level > current_user.level) {
                current_user.level = roles[i].level;
            }
        };
        current_user.roles = roles;
        return current_user.getDebt()
    }).then(function(debt){
        current_user.debt = debt;
        done(null, current_user);
    }).catch(function (err) {
        return done(err);
    });
});

passport.use(new LocalStrategy( function (username, password, done) {
    // Check username and password are set
    if (!password || !username) return done(null, false);
    var username = username.toLowerCase();

    // authorize user
    User.authorize(username, password)
        .then(function() {
            User.findByUsername(username).catch(function(err) {
                if (err.status != 404) throw err;
                return User.create(username);
            }).then(function(user) {
                done(null, user)
            }).catch(function(err) {
                done(err);
            });
        })
        .catch(function(err) {
            done(null, false);
        });
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
    if (process.env.NODE_ENV == "development") {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    } else {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    }
});

module.exports = app;
