import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateConstraints1550843220971 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "folders_owner_foreign"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "files_folder_id_foreign"`);
        await queryRunner.query(`ALTER TABLE "folders" ALTER COLUMN "parent_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "updated" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_938a930768697b6ece215667d8e" FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_27bc84e6954d2fa309a4f61326f" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_27bc84e6954d2fa309a4f61326f"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_938a930768697b6ece215667d8e"`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "updated" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "folders" ALTER COLUMN "parent_id" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_foreign" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "folders_owner_foreign" FOREIGN KEY ("owner") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
