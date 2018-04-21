
exports.seed = function(knex, Promise) {
  knex('roles').insert([
    {
      id: 1,
      title: 'Website Editor',
      level: 6,
      slug: 'Website-Editor'
    },
    {
      id: 2,
      title: "President",
      level: 6,
      slug: "President"
    }
  ]).returning('id').then(function(roleIDs) {
    knex('folders').insert([
      {
        name: 'Website Editor',
        owner_id: 1
      },
      {
        name: "President",
        owner_id: 2
      }
    ]);
  });
};
