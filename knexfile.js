// Update with your config settings.

module.exports = {

  testing: {
    client: 'sqlite3',
    debug: true,
    connection: {
        filename: './tests/db.sqlite3'
    }
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
