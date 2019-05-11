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
app.use(express.static(path.join(__dirname, 'ui')));

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
