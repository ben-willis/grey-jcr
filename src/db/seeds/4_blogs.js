
exports.seed = function(knex, Promise) {
  return knex('blogs').insert([
    {
      title: "Welcome",
      slug: "Welcome",
      message: "Welcome to the <b>Grey JCR Website</b>.",
      role_id: 2,
      author_username: "abcd12"
    }
  ]);
};
