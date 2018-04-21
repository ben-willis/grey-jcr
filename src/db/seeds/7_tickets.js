
exports.seed = function(knex, Promise) {
  return knex('tickets').insert([
    {
      name: "Grey Day 3000 Ticket",
      price: 500
    }
  ]);
};
