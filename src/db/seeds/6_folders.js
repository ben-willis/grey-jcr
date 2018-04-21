
exports.seed = function(knex, Promise) {
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
};
