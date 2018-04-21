
exports.seed = function(knex, Promise) {
  return knex('users').insert([
    {
      username: process.env.CIS_USERNAME,
      name: process.env.CIS_NAME,
      email: process.env.CIS_EMAIL
    },
    {
      username: "abcd12",
      name: "Alice Bob",
      email: "a.bob@durham.ac.uk"
    },
    {
      username: "wxyz89",
      name: "Walter Xylophone",
      email: "w.Xylophone@durham.ac.uk"
    }
  ]);
};
