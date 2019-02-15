import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNotNullConstraints1550274389854 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "debts" DROP CONSTRAINT "debts_username_foreign"`);
        await queryRunner.query(`ALTER TABLE "debts" ALTER COLUMN "amount" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "debts" ALTER COLUMN "debt_added" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "debts" ALTER COLUMN "username" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "debts" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "debts" ALTER COLUMN "debt_added" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "debts" ALTER COLUMN "amount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "debts" ADD CONSTRAINT "debts_username_foreign" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
