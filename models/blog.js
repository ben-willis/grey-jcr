var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');

var Blog = function (data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.message = data.message;
    this.author = data.author;
    this.position_id = data.position_id;
    this.updated = data.updated;
}
