import Debt from "./entities/Debt";
import AddDebtRequest from "./models/AddDebtRequest";

export default abstract class DebtsClient {
    abstract addDebt(addDebtRequest: AddDebtRequest): Promise<Debt>;

    abstract updateDebt(debtId: number, addDebtRequest: AddDebtRequest): Promise<Debt>;

    abstract getDebt(debtId: number): Promise<Debt>;

    abstract getDebts(username: string): Promise<Debt[]>;

    abstract getDailyDebts(): Promise<Array<{date: Date, amount: number}>>;
}