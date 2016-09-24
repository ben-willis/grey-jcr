var config = require('../knexfile.js')["development"]
var knex = require('knex')(config);

module.exports = knex;
