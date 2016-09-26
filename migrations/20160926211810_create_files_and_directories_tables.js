
exports.up = function(knex, Promise) {
    return knex.schema.createTable('folders', function(t) {
        t.increments('id').primary();
        t.text('name').notNull();
        t.integer("parent_id").default(0);
        t.integer("owner").references('id').inTable('positions').onDelete('CASCADE');
    }).then(function() {
        return knex.schema.createTable('files', function(t) {
            t.increments('id').primary();
            t.text('name').notNull();
            t.text('description').nullable();
            t.text('path').notNull();
            t.integer("folder_id").references('id').inTable('folders').onDelete('CASCADE');
            t.timestamp('updated').defaultTo(knex.fn.now());
        });
    });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('files').then(function(){
        return knex.schema.dropTable('folders');
    });
};
