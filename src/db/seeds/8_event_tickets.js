
exports.seed = function(knex, Promise) {
  return knex('event_tickets').insert([
    {
      event_id: 1,
      ticket_id: 1
    }
  ]);
};
