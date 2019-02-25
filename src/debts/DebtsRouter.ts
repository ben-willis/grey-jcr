import httpError from 'http-errors';
import express, {Router} from "express";

import * as User from "../models/user";
import DebtsClient from "./DebtsClient";

export default class DebtsRouter {
    public router: Router;

    constructor(debtsClient: DebtsClient, routerOptions?: express.RouterOptions) {
        this.router = express.Router(routerOptions);

        this.router.get("/debtors", (req, res, next) => {
            if (!req.user || req.user.level < 5) {
                return next(httpError(403));
            } else {
                User.getDebtors().then((debtors) => res.send(debtors)).catch(next);
            }
        });

        this.router.get("/debtors/daily", (req, res, next) => {
            if (!req.user || req.user.level < 5) {
                return next(httpError(403));
            } else {
                debtsClient.getDailyDebts().then((dailyDebts) => res.send(dailyDebts)).catch(next);
            }
        });

        this.router.get("/debtors/:username", (req, res, next) => {
            if (!req.user || (req.user.level < 5 && req.params.username !== req.user.username)) {
                return next(httpError(403));
            } else {
                debtsClient.getDebts(req.params.username).then((debts) => res.send(debts)).catch(next);
            }
        });

        this.router.post("/debtors/:username", (req, res, next) => {
            if (!req.user || (req.user.level < 5 && req.params.username !== req.user.username)) {
                return next(httpError(403));
            } else {
                debtsClient.addDebt({
                    name: req.body.name,
                    message: req.body.message,
                    amount: req.body.amount,
                    username: req.params.username,
                }).then((debt) => res.send(debt)).catch(next);
            }
        });

        this.router.post("/:username/debts/create-payment", (req, res, next) => {
            if (!req.user) return next(httpError(403));
            debtsClient.createPaypalPayment(Number(req.body.amount)).then((paymentId) => res.json({
                paymentId,
            })).catch(next);
        });
        
        this.router.post("/:username/debts/execute-payment", (req, res, next) => {
            if (!req.user) return next(httpError(403));
            debtsClient.executePaypalPayment(
                req.user.username,
                req.body.paymentId,
                req.body.payerId,
            ).then((debt) => res.json(debt)).catch(next);
        });
    };
}