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
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
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
