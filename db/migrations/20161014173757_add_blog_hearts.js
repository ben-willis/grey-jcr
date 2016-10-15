
exports.up = function(knex, Promise) {
    return knex.schema.createTable('blog_hearts', function(t) {
            t.string('username', 6).references('username').inTable('users').onDelete('SET NULL');
            t.integer('blog_id').references('id').inTable('blogs').onDelete('CASCADE');
            t.index(['username', 'blog_id']);
        });
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('blog_hearts');
};
