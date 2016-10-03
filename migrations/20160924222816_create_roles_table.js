
exports.up = function(knex, Promise) {
    return knex.schema.createTable('roles', function(t) {
            t.increments('id').primary();
            t.string('title')
            t.text('description').nullable();
            t.integer('level').defaultTo(0);
            t.string('slug').notNull();
        }).then(function() {
            return knex('roles').insert({
                title: 'Website Editor',
                level: 5,
                slug: 'Website-Editor'
            })
        });
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('roles');
};
