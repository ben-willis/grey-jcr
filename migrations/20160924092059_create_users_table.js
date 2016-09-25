
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(t) {
        t.string('username', 6).primary();
        t.string('email').notNull();
        t.string('name').nullable();
    }).then(function() {
        return knex('users').insert({
            username: 'hsdz38',
            name: 'Ben Willis',
            email: 'b.c.willis@durham.ac.uk'
        })
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
