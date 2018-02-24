var config = require('../knexfile.js')[process.env.NODE_ENV];
var knex = require('knex')(config);

module.exports = knex;
