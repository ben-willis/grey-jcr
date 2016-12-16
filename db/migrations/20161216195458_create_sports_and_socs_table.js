
exports.up = function(knex, Promise) {
    return knex.schema.createTable('society', function(t) {
        t.increments('id').primary();
        t.integer('type').comment('0: society, 1: sport');
        t.string('title');
        t.text('description');
        t.text('facebook').nullable();
        t.text('twitter').nullable();
        t.text('email').nullable();
        t.string('slug').notNull();
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('society');
};
