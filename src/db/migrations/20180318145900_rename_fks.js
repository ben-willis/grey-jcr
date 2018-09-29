exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("feedbacks", function(t) { 
			t.renameColumn("author", "author_username");
		}),
		knex.schema.table("blogs", function(t) {
			t.renameColumn("author", "author_username");
		}),
		knex.schema.table("folders", function(t) {
			t.renameColumn("owner", "owner_id");
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table("feedbacks", function(t) { 
			t.renameColumn("author_username", "author");
		}),
		knex.schema.table("blogs", function(t) {
			t.renameColumn("author_username", "author");
		}),
		knex.schema.table("folders", function(t) {
			t.renameColumn("owner_id", "owner");
		})
	]);
};
