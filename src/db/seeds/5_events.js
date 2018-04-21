
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  knex('events').insert([
    {
      id: 1,
      name: "Grey Day 3000",
      slug: "Grey-Day-3000",
      time: new Date(3000, 4, 31)
    }
  ]);
};
