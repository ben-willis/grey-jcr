
exports.seed = function(knex, Promise) {
  knex('tickets').insert([
    {
      id: 1,
      name: "Grey Day 3000 Ticket",
      price: 500
    }
  ]);
};
