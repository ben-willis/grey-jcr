
exports.up = function(knex, Promise) {
    return knex.schema.createTable('roles', function(t) {
            t.increments('id').primary();
            t.string('title')
            t.text('description').nullable();
            t.integer('level').defaultTo(0);
            t.string('slug').notNull();
        });
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('roles');
};
