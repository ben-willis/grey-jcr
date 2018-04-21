
exports.seed = function(knex, Promise) {
  knex("user_roles").insert([
    {
      username: process.env.CIS_USERNAME,
      role_id: 1
    },
    {
      username: "abcd12",
      role_id: 2
    }
  ]);
};
