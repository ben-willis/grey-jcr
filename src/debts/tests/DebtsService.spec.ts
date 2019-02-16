import { createConnection } from 'typeorm';
import { Connection, Repository } from 'typeorm';
import { expect } from "chai";
import "mocha";
import Debt from '../entities/Debt';
import DebtsFixtures from './DebtsFixtures';
import DebtsService from '../DebtsService';

describe("Debts service", () => {
    let connection: Connection;
    let debtsRepo: Repository<Debt>;
    let debtsFixtures: Debt[];
    let debtsService: DebtsService;

    before(async () => {
        connection = await createConnection("grey");
        debtsRepo = connection.getRepository(Debt);
        debtsService = new DebtsService(connection);
    });

    beforeEach(async () => {
        debtsFixtures = await new DebtsFixtures(debtsRepo).load();
    });

    afterEach(async () => {
        await new DebtsFixtures(debtsRepo).clear()
        debtsFixtures = [];
    });

    after(async () => {
        return connection.close();
    });

    it("should create a new debt", () => {
        return debtsService.addDebt({
            name: "New Test Debt",
            amount: 500,
            username: "abcd12",
        }).then((debt) => {
            return debtsRepo.findOneOrFail(debt.id);
        }).then((debt) => {
            expect(debt.name).to.equal("New Test Debt");
        });
    });

    it("should update an existing debt", () => {
        return debtsService.updateDebt(debtsFixtures[0].id, {
            name: "New Name",
            amount: 101,
            username: debtsFixtures[0].username
        }).then((debt) => {
            expect(debt.name).to.equal("New Name");
        });
    });

    it("should get a single debt", () => {
        return debtsService.getDebt(debtsFixtures[0].id).then((debt) => {
            expect(debt.name).to.equal(debtsFixtures[0].name);
        });
    });

    it("should get all debts for a user", () => {
        return debtsService.getDebts("efgh34").then((debts) => {
            expect(debts).to.have.length(3);
        })
    });

    it("should get the daily debts total", () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalDebt = debtsFixtures.reduce((a, b) => a + b.amount, 0);

        return debtsService.getDailyDebts().then((dailyDebts) => {
            expect(dailyDebts.find((d) => d.date.getTime() === today.getTime()).amount).to.equal(totalDebt);
        });
    });
});