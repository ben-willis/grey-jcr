
exports.up = function(knex, Promise) {
    return knex.schema.table('room_bookings', function(t) {
        t.timestamp('added').defaultTo(knex.fn.now());
        t.integer('status').defaultTo(0).comment('0:pending, 1:accepted, 2:rejected');
        t.string('username', 6).references('username').inTable('users').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('room_bookings', function(t) {
        t.dropColumn('added');
        t.dropColumn('status');
        t.dropColumn('username');
    })
};
