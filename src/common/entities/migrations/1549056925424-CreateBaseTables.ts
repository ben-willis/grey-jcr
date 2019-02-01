import {MigrationInterface, QueryRunner} from "typeorm";
import { readFile } from "fs";

export class CreateBaseTables1549056925424 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const existingTables: Array<{table_name: string}> = await queryRunner.query("SELECT table_name from information_schema.tables WHERE table_schema = 'public'");
        const existingTableNames = existingTables.map((t) => t.table_name);

        const createBaseTablesSQL = await new Promise<string>((resolve, reject) => {
            readFile(__dirname + "../../../../static/CreateBaseTables.sql", "utf8", (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        if (existingTables.length === 29 && existingTableNames.findIndex((name) =>  name === "knex_migrations") > -1) {
            console.log("Base tables already exist, no need to recreate");
            console.log("Dropping knex_migrations tables");
            await queryRunner.query("DROP TABLE knex_migrations;");
            await queryRunner.query("DROP TABLE knex_migrations_lock;");
        } else if (existingTables.length === 27) {
            console.log("Base tables already exist, no need to recreate");
        } else {
            await queryRunner.query(createBaseTablesSQL);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        // If you need to clear down all tables drop and recreate the database
    }

}
