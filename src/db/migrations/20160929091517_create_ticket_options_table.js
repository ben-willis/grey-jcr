
exports.up = function(knex, Promise) {
    return knex.schema.createTable('ticket_options', function(t) {
            t.increments('id').primary();
            t.string('name').notNull();
            t.integer('ticket_id').references('id').inTable('tickets').onDelete('CASCADE');
        }).then(function() {
            return knex.schema.createTable('ticket_option_choices', function(t) {
                t.increments('id').primary();
                t.string('name').notNull();
                t.integer('price').defaultTo(0);
                t.integer('option_id').references('id').inTable('ticket_options').onDelete('CASCADE');
            });
        });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('ticket_option_choices').then(function(){
        return knex.schema.dropTable('ticket_options');
    });
};
