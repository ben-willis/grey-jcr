import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateSocietiesConstraints1558817414759 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "societies" ALTER COLUMN "type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "societies" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "societies" ADD CONSTRAINT "UQ_a97ba8d21b9d3dc892ab10dae35" UNIQUE ("type", "slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "societies" DROP CONSTRAINT "UQ_a97ba8d21b9d3dc892ab10dae35"`);
        await queryRunner.query(`ALTER TABLE "societies" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "societies" ALTER COLUMN "type" DROP NOT NULL`);
    }

}
