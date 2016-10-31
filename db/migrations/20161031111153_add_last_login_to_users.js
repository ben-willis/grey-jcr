
exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(t) {
        t.timestamp('last_login').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(t) {
        t.dropColumn('last_login');
    })
};
