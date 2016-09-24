var config = require('../knexfile.js')["testing"]
var knex = require('knex')(config);

module.exports = knex;
