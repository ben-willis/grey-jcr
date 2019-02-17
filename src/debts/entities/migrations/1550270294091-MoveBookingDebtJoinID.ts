import {MigrationInterface, QueryRunner} from "typeorm";

export class MoveBookingDebtJoinID1550270294091 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "debts" DROP CONSTRAINT "debts_booking_id_foreign"`);
        await queryRunner.query(`ALTER TABLE "debts" DROP COLUMN "booking_id"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN "debt_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "debt_id"`);
        await queryRunner.query(`ALTER TABLE "debts" ADD COLUMN "booking_id" integer`);
        await queryRunner.query(`ALTER TABLE "debts" ADD CONSTRAINT "debts_booking_id_foreign" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
