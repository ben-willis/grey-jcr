
exports.seed = function(knex, Promise) {
  return knex('folders').insert([
    {
      name: 'Website Editor',
      owner_id: 1
    },
    {
      name: "President",
      owner_id: 2
    }
  ]);
};
