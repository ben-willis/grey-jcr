module.exports = {
    client: 'postgresql',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_TEST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        directory: './src/db/migrations',
        tableName: 'knex_migrations'
    },
    seeds: {
        directory: './src/db/seeds'
    }
};
