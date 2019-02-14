import {MigrationInterface, QueryRunner} from "typeorm";

export class DropForeignKeyConstraints1549061758412 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT "blogs_author_foreign"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT "blogs_role_id_foreign"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "blogs_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_foreign" FOREIGN KEY ("author") REFERENCES "users"("username") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
