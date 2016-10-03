
exports.up = function(knex, Promise) {
    return knex.schema.createTable('blogs', function(t) {
            t.increments('id').primary();
            t.string('title').notNull();
            t.string('slug').notNull();
            t.text('message').nullable();
            t.timestamp('updated').defaultTo(knex.fn.now());
            t.integer('role_id').references('id').inTable('roles').onDelete('SET NULL');
            t.string('author', 6).references('username').inTable('users').onDelete('SET NULL');
        });
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('blogs');
};
