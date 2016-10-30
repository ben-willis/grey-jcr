require('dotenv').config();

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
                    username: process.env.CIS_USERNAME,
                    name: process.env.CIS_NAME,
                    email: process.env.CIS_EMAIL
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
                    username: process.env.CIS_USERNAME,
                    role_id: 1
                })

            ])
        });
};
