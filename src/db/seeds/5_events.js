
exports.seed = function(knex, Promise) {
  return knex('events').insert([
    {
      name: "Grey Day 2020",
      slug: "Grey-Day-2020",
      time: new Date(2020, 4, 31)
    }
  ]);
};
