
exports.up = function(knex, Promise) {
    return knex.schema.createTable('societies', function(t) {
        t.increments('id').primary();
        t.integer('type').comment('0: society, 1: sport');
        t.string('name');
        t.text('description').nullable();
        t.text('facebook').nullable();
        t.text('twitter').nullable();
        t.text('email').nullable();
        t.string('slug').notNull();
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('societies');
};
