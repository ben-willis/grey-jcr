var config = require('../../knexfile.js');
var knex = require('knex')(config);

before(function(done) {
	knex.raw("DROP SCHEMA public CASCADE;").then(function() {
		return knex.raw("CREATE SCHEMA public;");
	}).then(function() {
		return knex.migrate.latest();
	}).then(function() {
		return knex.seed.run();
	}).then(function(){
		done();
	}).catch(done);
});