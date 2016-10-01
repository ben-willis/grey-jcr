
exports.up = function(knex, Promise) {
    return knex.schema.table('debts', function(t) {
        t.integer('booking_id').references('id').inTable('bookings').onDelete('SET NULL');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table('debts', function(t) {
        t.dropColumn('booking_id');
    })
};
