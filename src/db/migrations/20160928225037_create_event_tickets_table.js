
exports.up = function(knex, Promise) {
    return knex.schema.createTable('event_tickets', function(t) {
        t.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
        t.integer('ticket_id').references('id').inTable('tickets').onDelete('CASCADE');
        t.index(['event_id', 'ticket_id']);
    })
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('event_tickets');
};
