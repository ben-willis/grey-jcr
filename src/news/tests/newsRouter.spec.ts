import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import "mocha";
import MockNewsService from "./MockNewsService";
import express from "express";
import getNewsRouter from "../newsRouter";
import {articles as fakeArticles} from "./newsFixtures";

chai.use(chaiHttp);

describe("News router", () => {
    const mockNewsService = new MockNewsService(fakeArticles);

    const app = express();
    app.use("/news/", getNewsRouter(mockNewsService));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json(err);
    });

    it("should get an article by date and slug", () => {
        const fakeArticle = fakeArticles[0];
        return chai.request(app).get(
            "/news/" +
            fakeArticle.updated.getFullYear() +
            "/" +
            (fakeArticle.updated.getMonth() + 1) +
            "/" +
            fakeArticle.updated.getDate() +
            "/" +
            fakeArticle.slug
        ).then((res) => {
            expect(res.body.id).to.equal(fakeArticle.id);
        })
    });

    it("should return an error if unauthenticated user deletes an article", () => {
        return chai.request(app).del("/news/" + fakeArticles[0].id).then((res) => {
            expect(res.status).to.not.equal(200);
        }, (err) => {
            expect(err.status).to.equal(403);
        });
    })
});