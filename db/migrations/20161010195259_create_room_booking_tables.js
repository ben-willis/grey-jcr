
exports.up = function(knex, Promise) {
    return knex.schema.createTable('rooms', function(t) {
        t.increments('id').primary();
        t.text('name').notNull();
        t.text('description').nullable();
    }).then(function() {
        return knex.schema.createTable('room_bookings', function(t) {
            t.increments('id').primary();
            t.integer('room_id').references('id').inTable('rooms').onDelete('CASCADE');
            t.text('name').notNull();
            t.text('notes').nullable();
            t.timestamp('start_time').notNull();
            t.integer('duration').defaultTo(60);
        });
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('room_bookings').then(function() {
        return knex.schema.dropTable('rooms');
    });
};
