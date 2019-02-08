import { Connection } from "typeorm";

import {articles} from "../news/tests/newsFixtures";

export default class FixturesLoader {
    constructor(private connection: Connection) {};

    private fixtureSets = {
        "Article": articles
    };

    public loadFixtures(): Promise<any> {
        return Promise.all(Object.keys(this.fixtureSets).map((fixture) => {
            const fixturesRepo = this.connection.getRepository(fixture);
            fixturesRepo.save(this.fixtureSets[fixture]);
        }));
    }
}