import DebtsClient from "../DebtsClient";
import AddDebtRequest from "../models/AddDebtRequest";
import Debt from "../entities/Debt";

export default class MockDebtsService implements DebtsClient {
    async addDebt(addDebtRequest: AddDebtRequest): Promise<Debt> {
        const debt = new Debt();
        debt.id = 1;
        debt.name = addDebtRequest.name;
        debt.message = addDebtRequest.message;
        debt.amount = addDebtRequest.amount;
        debt.added = new Date();
        debt.username = addDebtRequest.username;
        return debt;
    }

    async updateDebt(debtId: number, addDebtRequest: AddDebtRequest): Promise<Debt> {
        const debt = new Debt();
        debt.id = debtId;
        debt.name = addDebtRequest.name;
        debt.message = addDebtRequest.message;
        debt.amount = addDebtRequest.amount;
        debt.added = new Date();
        debt.username = addDebtRequest.username;
        return debt;
    }

    async getDebt(debtId: number): Promise<Debt> {
        const debt = new Debt();
        debt.id = debtId;
        debt.name = "Mock Debt";
        debt.amount = 2500;
        debt.added = new Date();
        debt.username = "abcd12";
        return debt;
    }

    async getDebts(username: string): Promise<Debt[]> {
        return [];
    }

    async getDailyDebts(): Promise<Array<{date: Date, amount: number}>> {
        return [];
    }

    async createPaypalPayment(amount: number): Promise<string> {
        return "PAY123456789";
    }

    async executePaypalPayment(username: string, paymentId: string, payerId: string): Promise<Debt> {
        const debt = new Debt();
        debt.id = 1;
        debt.name = "Paypal";
        debt.message = "Payment ID: " + paymentId;
        debt.amount = -500;
        debt.added = new Date();
        debt.username = username;
        return debt;
    }
}