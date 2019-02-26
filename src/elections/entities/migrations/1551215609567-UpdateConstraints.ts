import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateConstraints1551215609567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "election_votes" DROP CONSTRAINT "election_votes_username_foreign"`);
        await queryRunner.query(`ALTER TABLE "election_votes" DROP CONSTRAINT "election_votes_nominee_id_foreign"`);
        await queryRunner.query(`ALTER TABLE "election_votes" DROP CONSTRAINT "election_votes_position_id_foreign"`);
        await queryRunner.query(`ALTER TABLE "election_votes" DROP CONSTRAINT "election_votes_election_id_foreign"`);
        await queryRunner.query(`ALTER TABLE "election_position_nominees" DROP CONSTRAINT "election_position_nominees_position_id_foreign"`);
        await queryRunner.query(`ALTER TABLE "election_positions" DROP CONSTRAINT "election_positions_election_id_foreign"`);
        await queryRunner.query(`ALTER TABLE "elections" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "election_votes" ADD CONSTRAINT "FK_401973d7233af296c3bdffe453f" FOREIGN KEY ("nominee_id") REFERENCES "election_position_nominees"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "election_votes" ADD CONSTRAINT "FK_975bce92a288cfe6c1743e88bea" FOREIGN KEY ("position_id") REFERENCES "election_positions"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "election_votes" ADD CONSTRAINT "FK_6aa8eae7db582a353d25b8018da" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "election_position_nominees" ADD CONSTRAINT "FK_e0056437fbdb7c2f0c59ac86da1" FOREIGN KEY ("position_id") REFERENCES "election_positions"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "election_positions" ADD CONSTRAINT "FK_e1ca173f778f74aa98b03a40948" FOREIGN KEY ("election_id") REFERENCES "elections"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "election_positions" DROP CONSTRAINT "FK_e1ca173f778f74aa98b03a40948"`);
        await queryRunner.query(`ALTER TABLE "election_position_nominees" DROP CONSTRAINT "FK_e0056437fbdb7c2f0c59ac86da1"`);
        await queryRunner.query(`ALTER TABLE "election_votes" DROP CONSTRAINT "FK_6aa8eae7db582a353d25b8018da"`);
        await queryRunner.query(`ALTER TABLE "election_votes" DROP CONSTRAINT "FK_975bce92a288cfe6c1743e88bea"`);
        await queryRunner.query(`ALTER TABLE "election_votes" DROP CONSTRAINT "FK_401973d7233af296c3bdffe453f"`);
        await queryRunner.query(`ALTER TABLE "elections" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "election_positions" ADD CONSTRAINT "election_positions_election_id_foreign" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "election_position_nominees" ADD CONSTRAINT "election_position_nominees_position_id_foreign" FOREIGN KEY ("position_id") REFERENCES "election_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_election_id_foreign" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_position_id_foreign" FOREIGN KEY ("position_id") REFERENCES "election_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_nominee_id_foreign" FOREIGN KEY ("nominee_id") REFERENCES "election_position_nominees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_username_foreign" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
