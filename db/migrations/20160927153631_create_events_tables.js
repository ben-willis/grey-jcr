
exports.up = function(knex, Promise) {
    return knex.schema.createTable('events', function(t) {
        t.increments('id').primary();
        t.text('name').notNull();
        t.text('slug').notNull();
        t.text('description').nullable();
        t.text('image').nullable();
        t.timestamp('time').defaultTo(knex.fn.now());
    });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('events');
};
