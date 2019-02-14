module.exports = [{
    "name": "grey",
    "type": "postgres",
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "entities": ["dist/**/entities/*.js"],
    "migrations": ["dist/**/entities/migrations/*.js"],
    "migrationsTableName": "typeorm_migrations"
}]