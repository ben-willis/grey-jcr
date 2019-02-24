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

    private fixtureManagers = {
        debts: new DebtsFixtures(this.connection.getRepository("Debt")),
        roles: new RoleFixtures(this.connection.getRepository("Role"), this.connection.getRepository("RoleUser")),
        files: new FileFixtureManager(this.connection.getRepository("File"), this.connection.getRepository("Folder"))
    };

    public async loadFixtures(): Promise<void> {
        const loadFromFixtureSets = Object.keys(this.fixtureSets).map((fixture) => {
            const fixturesRepo = this.connection.getRepository(fixture);
            return fixturesRepo.save(this.fixtureSets[fixture]);
        });

        await this.fixtureManagers.debts.load();
        await this.fixtureManagers.roles.load([process.env.CIS_USERNAME]);
        await this.fixtureManagers.files.load(this.fixtureManagers.roles.roles.map(r => r.id));
    }

    public clearFixtures(): Promise<any> {
        const clearFromFixtureSets = Object.keys(this.fixtureSets).map((fixture) => {
            const fixturesRepo = this.connection.getRepository(fixture);
            return fixturesRepo.delete({}).then(() => null);
        });

        const clearFromFixtureManagers = Object.keys(this.fixtureManagers).map(fm => this.fixtureManagers[fm].clear());

        return Promise.all(clearFromFixtureSets.concat(clearFromFixtureManagers));
    }
}