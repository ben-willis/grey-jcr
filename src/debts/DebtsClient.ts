import Debt from "./entities/Debt";
import AddDebtRequest from "./models/AddDebtRequest";

export default interface DebtsClient {
    addDebt(addDebtRequest: AddDebtRequest): Promise<Debt>;
    updateDebt(debtId: number, addDebtRequest: AddDebtRequest): Promise<Debt>;
    getDebt(debtId: number): Promise<Debt>;
    getDebts(username: string): Promise<Debt[]>;
    getDailyDebts(): Promise<Array<{date: Date, amount: number}>>;
    createPaypalPayment(amount: number): Promise<string>;
    executePaypalPayment(username: string, paymentId: string, payerId: string): Promise<Debt>;
}