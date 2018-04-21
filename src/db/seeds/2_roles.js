
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
  ]);
};
