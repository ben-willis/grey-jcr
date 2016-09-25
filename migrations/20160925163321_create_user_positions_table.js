
exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_positions', function(t) {
            t.string('username', 6).references('username').inTable('users').onDelete('CASCADE');
            t.integer('position_id').references('id').inTable('positions').onDelete('CASCADE');
            t.index(['username', 'position_id']);
        }).then(function() {
            return knex('user_positions').insert({
                username: 'hsdz38',
                position_id: 1
            })
        })
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTable('user_positions');
};
