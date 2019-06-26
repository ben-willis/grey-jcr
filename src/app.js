require('dotenv').config({path: __dirname + "/../.env"})

/* REQUIREMENTS*/
import cors from "cors";
import getNewsRouter from "./news/newsRouter";
import NewsService from "./news/NewsService";
import { getConnection } from "typeorm";
import DebtsService from './debts/DebtsService';
import DebtsRouter from './debts/DebtsRouter';
import FileServiceImpl from "./files/FileServiceImpl";
import FileRouter from "./files/FileRouter";
import RoleServiceImpl from './roles/RoleServiceImpl';

const connection = getConnection("grey");

const databaseConnection = getConnection("grey");

const rolesService = new RoleServiceImpl(connection.getRepository("Role"), connection.getRepository("RoleUser"))
const newsService = new NewsService(databaseConnection, rolesService);
const debtsService = new DebtsService(databaseConnection);
const fileService = new FileServiceImpl(connection.getRepository("File"), connection.getRepository("Folder"));

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

const corsOptions = {
    origin: ["http://localhost:9000", "http://localhost:9001"],
    credentials: true,
};
  
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var User = require('./models/user');

app.use(favicon(path.join(__dirname, 'ui', 'favicon.ico')));
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
app.use(express.static(path.join(__dirname, 'ui')));

/* PASSPORT */
passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    var current_user = null;
    User.findByUsername(username).then(function(user){
        current_user = user;
        return rolesService.getRolesForUser(current_user.username);
    }).then(function(roles) {
        return Promise.all(
            roles.map(function(role) {
                return fileService.getFolderForOwner(role.id).then((folder) => {
                    role.folder = folder;
                    return role;
                });
            })
        )
    }).then(function(roles) {
        current_user.level = Math.max(...roles.map(r => r.level));
        current_user.roles = roles;
        return debtsService.getDebts(current_user.username);
    }).then(function(debts){
        current_user.debt = debts.reduce((a, b) => a + b.amount, 0);
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

app.use("/api/news/", getNewsRouter(newsService));
app.use("/api/debts/", new DebtsRouter(debtsService).router);
app.use("/api/files/", new FileRouter(fileService).router);

app.use("/files/", (req, res, next) => {
    res.sendFile(process.env.FILES_DIRECTORY + decodeURIComponent(req.path));
});

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
