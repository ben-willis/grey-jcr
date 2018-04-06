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
                }).returning('username'),
                knex('roles').insert({
                    title: 'Website Editor',
                    level: 6,
                    slug: 'Website-Editor'
                }).returning('id')
            ]);
        })
        .then(function(ids) {
            return Promise.all([
                knex('folders').insert({
                    name: 'Website Editor',
                    owner: ids[1][0]
                }),
                knex('user_roles').insert({
                    username: ids[0][0],
                    role_id: ids[1][0]
                })
            ]);
        });
};
