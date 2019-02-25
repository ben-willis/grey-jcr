import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import MockDebtsService from "./MockDebtsService";
import express from "express";
import DebtsRouter from "../DebtsRouter";
import { Express } from "express-serve-static-core";
import bodyParser from "body-parser";

chai.use(chaiHttp);

describe("Debts Router", () => {
    const mockDebtsService = new MockDebtsService();
    let app: Express;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use("/debts/", new DebtsRouter(mockDebtsService).router);
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.json(err);
        });
    })

    afterEach(() => app = undefined);    

    it("should return a payment id when creating a payment", () => {
        app.request.user = {username: "aaaa11"};
        return chai.request(app).post("/debts/aaaa11/debts/create-payment").send({amount: 500}).then(res => {
            expect(res.body).to.have.property("paymentId");
        });
    });

    it("should return a 403 when creating a payment if user is not logged in", () => {
        return chai.request(app).post("/debts/aaaa11/debts/create-payment").send({amount: 500}).then(res => {
            expect(res.status).to.equal(403);
        })
    });
});
