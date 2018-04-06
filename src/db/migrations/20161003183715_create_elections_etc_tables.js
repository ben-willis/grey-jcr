
exports.up = function(knex, Promise) {
    return knex.schema.createTable('elections', function(t) {
        t.increments('id').primary();
        t.text('name').notNull();
        t.integer('status').defaultTo(0).comment('0:closed, 1:public, 2:open');
    }).then(function() {
        return knex.schema.createTable('election_positions', function(t) {
            t.increments('id').primary();
            t.text('name').notNull();
            t.integer('election_id').references('id').inTable('elections').onDelete('CASCADE');
        });
    }).then(function() {
        return knex.schema.createTable('election_position_nominees', function(t) {
            t.increments('id').primary();
            t.text('name').notNull();
            t.text('manifesto').nullable();
            t.integer('position_id').references('id').inTable('election_positions').onDelete('CASCADE');
        });
    }).then(function() {
        return knex.schema.createTable('election_votes', function(t){
            t.increments('id').primary();
            t.integer('election_id').references('id').inTable('elections').onDelete('CASCADE');
            t.integer('position_id').references('id').inTable('election_positions').onDelete('CASCADE');
            t.integer('nominee_id').references('id').inTable('election_position_nominees').onDelete('CASCADE');
            t.string('preference').notNull();
            t.string('usercode').notNull();
            t.string('username', 6).references('username').inTable('users').onDelete('SET NULL');
        });
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('election_votes').then(function() {
        return knex.schema.dropTable('election_position_nominees');
    }).then(function() {
        return knex.schema.dropTable('election_positions');
    }).then(function() {
        return knex.schema.dropTable('elections');
    })
};
