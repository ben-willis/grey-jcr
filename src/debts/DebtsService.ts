import axios from 'axios';
import { Connection, Repository } from "typeorm";

import DebtsClient from "./DebtsClient";
import AddDebtRequest from "./models/AddDebtRequest";
import Debt from "./entities/Debt";

const PAYPAL_API_URL = (process.env.PAYPAL_MODE === "sandbox")
    ? "https://api.sandbox.paypal.com"
    : "https://api.paypal.com"

export default class DebtsService implements DebtsClient {
    constructor(dbConnection: Connection) {
        this.debtsRepo = dbConnection.getRepository(Debt);
    };

    private debtsRepo: Repository<Debt>;
    private paypalAuthToken: string;
    private paypalAuthTokenExpiry: Date;

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
            .select("date(debt.added), sum(debt.amount)")
            .groupBy("date(debt.added)")
            .orderBy("date(debt.added)")
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

    async createPaypalPayment(amount: number): Promise<string> {
        const authToken = await this.getPaypalAuthToken();
    
        const newPayment = {
            intent: "sale",
            payer: {
                payment_method: "paypal",
            },
            redirect_urls: {
                return_url: "https://greyjcr.com/",
                cancel_url: "https://greyjcr.com/",
            },
            transactions: [{
                amount: {currency: "GBP", total: (amount / 100).toFixed(2)},
                description: "Clear debt to Grey JCR",
            }],
        };
    
        return axios.post(PAYPAL_API_URL + "/v1/payments/payment/", newPayment, {
            headers: {
                Authorization: "bearer " + authToken,
            },
        }).then((res) => {
            return res.data.id;
        });
    }

    async executePaypalPayment(username: string, paymentId: string, payerId: string): Promise<Debt> {
        const authToken = await this.getPaypalAuthToken();
    
        return axios.post(PAYPAL_API_URL + "/v1/payments/payment/" + paymentId + "/execute", {
            payer_id: payerId,
        }, {
            headers: {
                Authorization: "bearer " + authToken,
            },
        }).then((res) => {
            return this.addDebt({
                name: "PayPal Payment",
                amount: -Math.floor(Number(res.data.transactions[0].amount.total) * 100),
                username,
                message: "Payment ID: " + JSON.stringify(res.data.id),
            });
        });
    }

    private async getPaypalAuthToken(): Promise<string> {
        const now = new Date();
        if (this.paypalAuthToken && now.getTime() < this.paypalAuthTokenExpiry.getTime()) {
            return this.paypalAuthToken;
        }
    
        return axios.post(PAYPAL_API_URL + "/v1/oauth2/token", "grant_type=client_credentials", {
            auth: {
                username: process.env.PAYPAL_CLIENT_ID,
                password: process.env.PAYPAL_CLIENT_SECRET,
            },
        }).then((res) => {
            this.paypalAuthToken = res.data.access_token;
            this.paypalAuthTokenExpiry = new Date(now.getTime() + Number(res.data.expires_in) * 1000);
            return this.paypalAuthToken;
        });
    }
}