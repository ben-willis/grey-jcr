import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterConstraintsOnRolesTables1550783990820 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_username_foreign"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_foreign"`);
        await queryRunner.query(`DROP INDEX "user_roles_username_role_id_index"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_1beb1563552f67dc8a1e3087de0" PRIMARY KEY ("username", "role_id")`);
        await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "role_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "level" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "level" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "level" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "level" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "role_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_1beb1563552f67dc8a1e3087de0"`);
        await queryRunner.query(`CREATE INDEX "user_roles_username_role_id_index" ON "user_roles" ("username", "role_id") `);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_username_foreign" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
