
exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_roles', function(t) {
            t.string('username', 6).references('username').inTable('users').onDelete('CASCADE');
            t.integer('role_id').references('id').inTable('roles').onDelete('CASCADE');
            t.index(['username', 'role_id']);
        }).then(function() {
            return knex('user_roles').insert({
                username: 'hsdz38',
                role_id: 1
            })
        })
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('user_roles');
};
