// Update with your config settings.

module.exports = {

  testing: {
    client: 'sqlite3',
    //debug: true,
    connection: {
        filename: './test_db.sqlite3'
    },
    useNullAsDefault: true
  },

  development: {
    client: 'postgresql',
    connection: {
        host: 'localhost',
        database: 'grey',
        user:     'ben',
        password: 'password'
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }
  }

};
