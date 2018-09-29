
exports.seed = function(knex, Promise) {
  return knex('roles').insert([
    {
      title: 'Website Editor',
      level: 6,
      slug: 'Website-Editor'
    },
    {
      title: "President",
      level: 6,
      slug: "President"
    }
  ]);
};
