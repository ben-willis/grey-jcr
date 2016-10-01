
exports.up = function(knex, Promise) {
    return knex.schema.createTable('bookings', function(t) {
        t.increments('id').primary();
        t.string('username', 6).references('username').inTable('users').onDelete('CASCADE');
        t.text('guestname').nullable();
        t.text('notes').nullable();
        t.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
        t.integer('ticket_id').references('id').inTable('tickets').onDelete('CASCADE');
        t.string('booked_by', 6).references('username').inTable('users').onDelete('SET NULL');
    }).then(function() {
        return knex.schema.createTable('booking_choices', function(t) {
            t.integer('booking_id').references('id').inTable('bookings').onDelete('CASCADE');
            t.integer('choice_id').references('id').inTable('ticket_option_choices').onDelete('CASCADE');
            t.index(['booking_id', 'choice_id']);
        });
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('booking_choices').then(function() {
        return knex.schema.dropTable('bookings');
    });
};
