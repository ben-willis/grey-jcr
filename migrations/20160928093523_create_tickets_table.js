
exports.up = function(knex, Promise) {
    return knex.schema.createTable('tickets', function(t) {
        t.increments('id').primary();
        t.text('name').notNull();
        t.integer('max_booking').defaultTo(8);
        t.integer('min_booking').defaultTo(1);
        t.boolean('allow_debtors').defaultTo(false);
        t.boolean('allow_guests').defaultTo(false);
        t.timestamp('open_booking').defaultTo(knex.fn.now());
        t.timestamp('close_booking').defaultTo(knex.fn.now());
        t.integer('price').defaultTo(0);
        t.integer('guest_surcharge').defaultTo(0);
    });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('tickets');
};
