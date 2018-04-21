
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  knex('blogs').insert([
    {
      id: 1,
      title: "Welcome",
      slug: "Welcome",
      message: "Welcome to the <b>Grey JCR Website</b>.",
      role_id: 2,
      author_username: "abcd12"
    }
  ]);
};
