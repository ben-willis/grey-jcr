
exports.up = function(knex, Promise) {
    return knex.schema.createTable('valentines_pairs', function(t) {
        t.increments('id').primary();
        t.string('lead');
        t.string('partner');
        t.integer('position');
        t.integer('value').defaultTo(50);
    }).then(function() {
        return knex.schema.createTable('valentines_swaps', function(t) {
            t.increments('id').primary();
            t.integer('paira_id').references('id').inTable('valentines_pairs').onDelete('CASCADE');
            t.integer('pairb_id').references('id').inTable('valentines_pairs').onDelete('CASCADE');
            t.string('username', 6).references('username').inTable('users').onDelete('SET NULL');
            t.timestamp('created').defaultTo(knex.fn.now());
            t.integer('cost').defaultTo(0);
        });
    }).then(function() {
        return knex.schema.createTable('valentines_status', function(t) {
            t.boolean("open");
            t.timestamp('updated').defaultTo(knex.fn.now());
        })
    }).then(function() {
        return knex('valentines_status').insert({open: false});
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('valentines_swaps').then(function() {
        return knex.schema.dropTable('valentines_pairs');
    }).then(function() {
        return knex.schema.dropTable('valentines_status');
    });
};
