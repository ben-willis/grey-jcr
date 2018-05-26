
exports.seed = function(knex, Promise) {
	var now = new Date();
  return knex('tickets').insert([
    {
      name: "Grey Day 2020 Ticket",
      price: 500,
      stock: 100,
      open_booking: new Date(now.getTime()),
      close_booking: new Date(now.getTime() + 24*60*60*1000)
    }
  ]);
};
