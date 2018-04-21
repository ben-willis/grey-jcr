
exports.seed = function(knex, Promise) {
  return knex('events').insert([
    {
      name: "Grey Day 3000",
      slug: "Grey-Day-3000",
      time: new Date(3000, 4, 31)
    }
  ]);
};
