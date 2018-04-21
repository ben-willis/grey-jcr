var config = require('../../knexfile.js');
var knex = require('knex')(config);

before(function(done) {
	console.log("Drop and create public schema");
	knex.raw("DROP SCHEMA public CASCADE;").then(function() {
		return knex.raw("CREATE SCHEMA public;");
	}).then(function() {
		console.log("Migrate latest");
		return knex.migrate.latest();
	}).then(function() {
		console.log("Run seeds");
		return knex.seed.run();
	}).then(function(){
		done();
	}).catch(done);
});