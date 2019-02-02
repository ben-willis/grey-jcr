import {MigrationInterface, QueryRunner} from "typeorm";

export class DropBlogHeartsTable1549066341383 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query("DROP TABLE blog_hearts;");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query("CREATE TABLE public.blog_hearts (username character varying(6), blog_id integer);");
    }

}
