import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import "mocha";
import MockFileService from "./MockFileServiceImpl";
import express from "express";
import FileRouter from "../FileRouter";

chai.use(chaiHttp);

describe("File Router", () => {
    const mockFileService = new MockFileService();

    const app = express();
    app.use("/files/", new FileRouter(mockFileService).router);
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json(err);
    });

    it("should get a folder", () => {
        return chai.request(app).get("/files/folders/1").then((res) => {
            expect(res.body.id).to.equal(1);
            expect(res.body).to.have.property("name");
            expect(res.body).to.have.property("subfolders");
            expect(res.body).to.have.property("files");
        });
    });

    it("should get a file", () => {
        return chai.request(app).get("/files/1").then((res) => {
            expect(res.body.id).to.equal(1);
            expect(res.body).to.have.property("name");
        });
    });
});