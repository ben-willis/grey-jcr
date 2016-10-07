var csv = require('csv')

exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return Promise.all([
        knex('users').del(),
        knex('roles').del(),
        knex('folders').del(),
        knex('user_roles').del()
    ])
        .then(function () {
            return Promise.all([
                // Inserts seed entries
                knex('users').insert({
                    username: 'hsdz38',
                    name: 'Ben Willis',
                    email: 'b.c.willis@durham.ac.uk'
                }),
                knex('roles').insert({
                    title: 'Website Editor',
                    level: 5,
                    slug: 'Website-Editor'
                })
            ]);
        })
        .then(function() {
            return Promise.all([
                knex('folders').insert({
                    name: 'Website Editor',
                    owner: 1
                }),
                knex('user_roles').insert({
                    username: 'hsdz38',
                    role_id: 1
                })

            ])
        });
};
