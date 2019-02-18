import { Connection, Repository } from "typeorm";

import DebtsClient from "./DebtsClient";
import AddDebtRequest from "./models/AddDebtRequest";
import Debt from "./entities/Debt";

export default class DebtsService extends DebtsClient {
    constructor(dbConnection: Connection) {
        super();
        this.debtsRepo = dbConnection.getRepository(Debt);
    };

    private debtsRepo: Repository<Debt>;

    async addDebt(addDebtRequest: AddDebtRequest): Promise<Debt> {
        return this.debtsRepo.save({
            name: addDebtRequest.name,
            message: addDebtRequest.message,
            link: addDebtRequest.link,
            amount: addDebtRequest.amount,
            username: addDebtRequest.username,
        });
    }

    async updateDebt(debtId: number, addDebtRequest: AddDebtRequest): Promise<Debt> {
        const debt = await this.debtsRepo.findOneOrFail(debtId);
        const updatedDebt = this.debtsRepo.merge(debt, addDebtRequest);

        return this.debtsRepo.save(updatedDebt);
    }

    async getDebt(debtId: number): Promise<Debt> {
        return this.debtsRepo.findOneOrFail(debtId);
    }

    async getDebts(username: string): Promise<Debt[]> {
        return this.debtsRepo.createQueryBuilder("debt")
            .where("debt.username = :username", { username: username })
            .orderBy("debt.debt_added",  "DESC")
            .getMany();
    }

    async getDailyDebts(): Promise<Array<{date: Date, amount: number}>> {
        const rawDailyTotals = await this.debtsRepo.createQueryBuilder("debt")
            .select("date(debt.debt_added), sum(debt.amount)")
            .groupBy("date(debt.debt_added)")
            .orderBy("date(debt.debt_added)", "DESC")
            .getRawMany();

        let runningTotal = 0;

        return rawDailyTotals.map((dateToValue) => {
            runningTotal += Number(dateToValue.sum);
            return {
                date: new Date(dateToValue.date),
                amount: runningTotal,
            };
        });
    }
}