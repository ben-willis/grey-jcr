
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(t) {
            t.string('username', 6).primary();
            t.string('email').notNull();
            t.string('name').nullable();
        });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
