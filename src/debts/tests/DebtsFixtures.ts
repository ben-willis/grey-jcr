import { Repository } from "typeorm";
import Debt from "../entities/Debt";

export default class DebtsFixtures {
    constructor(private debtsRepo: Repository<Debt>) {};

    public debts = (now: Date) => [
        {name: "Debt1", amount: 1000, added: new Date(now.getTime()), username: "abcd12"},
        {name: "Debt2", amount: 2000, added: new Date(now.getTime()), username: "efgh34"},
        {name: "Debt3", amount: 200, added: new Date(now.getTime() - (1000 * 60 * 60 * 24 * 3)), username: "efgh34"},
        {name: "Debt4", amount: 100, added: new Date(now.getTime() - (1000 * 60 * 60 * 24 * 7)), username: "efgh34"},
    ]

    async load(): Promise<Debt[]> {
        return this.debtsRepo.save(this.debts(new Date()));
    }

    async clear(): Promise<void> {
        return this.debtsRepo.clear();
    }
}