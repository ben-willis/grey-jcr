import { Connection } from "typeorm";

import {articles} from "../news/tests/newsFixtures";
import DebtsFixtures from "..//debts/tests/DebtsFixtures";
import FileFixtureManager from "../files/tests/FileFixtureManager";
import RoleFixtures from "../roles/tests/RoleFixtures";

export default class FixturesLoader {
    constructor(private connection: Connection) {};

    private fixtureSets = {
        "Article": articles
    };

    private fixtureManagers = [
        new DebtsFixtures(this.connection.getRepository("Debt")),
        new RoleFixtures(this.connection.getRepository("Role"), this.connection.getRepository("RoleUser")),
        new FileFixtureManager(this.connection.getRepository("File"), this.connection.getRepository("Folder"))
    ]

    public loadFixtures(): Promise<any> {
        const loadFromFixtureSets = Object.keys(this.fixtureSets).map((fixture) => {
            const fixturesRepo = this.connection.getRepository(fixture);
            return fixturesRepo.save(this.fixtureSets[fixture]);
        });

        const loadFromFixtureManagers = this.fixtureManagers.map(fm => fm.load());

        return Promise.all(loadFromFixtureSets.concat(loadFromFixtureManagers));
    }

    public clearFixtures(): Promise<any> {
        const clearFromFixtureSets = Object.keys(this.fixtureSets).map((fixture) => {
            const fixturesRepo = this.connection.getRepository(fixture);
            return fixturesRepo.delete({}).then(() => null);
        });

        const clearFromFixtureManagers = this.fixtureManagers.map(fm => fm.clear());

        return Promise.all(clearFromFixtureSets.concat(clearFromFixtureManagers));
    }
}