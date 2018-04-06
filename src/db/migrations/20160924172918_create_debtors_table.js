
exports.up = function(knex, Promise) {
    return knex.schema.createTable('debts', function(t) {
            t.increments('id').primary();
            t.string('name').notNull();
            t.text('message').nullable();
            t.text('link').nullable();
            t.integer('amount').defaultTo(0);
            t.timestamp('debt_added').defaultTo(knex.fn.now());
            t.string('username', 6).references('username').inTable('users').onDelete('CASCADE');
        });
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('debts');
};
