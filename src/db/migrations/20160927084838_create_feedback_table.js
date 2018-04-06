
exports.up = function(knex, Promise) {
    return knex.schema.createTable('feedbacks', function(t) {
        t.increments('id').primary();
        t.string('author', 6).references('username').inTable('users').onDelete('CASCADE');
        t.text('title').notNull();
        t.text('message').notNull();
        t.integer("parent_id").references('id').inTable('feedbacks').onDelete('CASCADE');
        t.boolean("exec");
        t.boolean("anonymous");
        t.boolean("archived");
        t.boolean("read_by_user");
        t.timestamp('created').defaultTo(knex.fn.now());
    });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('feedbacks');
};
