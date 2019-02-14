import { expect } from "chai";
import "mocha";
import sinon from "sinon";
import { Connection, createConnection } from "typeorm";

import CreateArticleRequest from "./../models/CreateArticleRequest";
import UpdateArticleRequest from "./../models/UpdateArticleRequest";

import Article from "../entities/Article";
import NewsService from "../NewsService";

import Role from "../../models/role";
import User from "../../models/user";

describe("News service", () => {
    let connection: Connection;
    let testArticle: Article;

    before(async () => {
        connection = await createConnection("grey");

        const fakeUser = new User({name: "Fake User", email: "f.user@durham.ac.uk", username: "abcd12"});
        const fakeRole = new Role({id: 1, name: "Fake Role"});

        sinon.stub(User, "findByUsername").returns(Promise.resolve(fakeUser));
        sinon.stub(Role, "findById").returns(Promise.resolve(fakeRole));
    });

    beforeEach(async () => {
        const articleRepo = connection.getRepository(Article);
        const article = articleRepo.create({
            title: "Test Article",
            slug: "test-article",
            content: "test test test",
            authorUsername: "abcd12",
            roleId: 1,
        });
        testArticle = await articleRepo.save(article);
    });

    afterEach(() => {
        const articleRepo = connection.getRepository(Article);
        return articleRepo.clear();
    });

    after(() => {
        sinon.restore();
        return connection.close();
    });

    it("should create a new article", () => {
        const createArticleRequest = {
            title: "New Article",
            content: "Blah blah blah",
            author: "abcd12",
            roleId: 1,
        } as CreateArticleRequest;

        return new NewsService(connection).createArticle(createArticleRequest).then((createdArticle) => {
            expect(createdArticle.title).to.equal(createArticleRequest.title);
            expect(createdArticle.content).to.equal(createArticleRequest.content);
            expect(createdArticle.author.username).to.equal(createArticleRequest.author);
            expect(createdArticle.role.id).to.equal(createArticleRequest.roleId);
        });
    });

    it("should update an existing article", () => {
        const updateArticleRequest = {
            articleId: testArticle.id,
            title: "Updated Title",
            content: "update update update",
        } as UpdateArticleRequest;

        return new NewsService(connection).updateArticle(updateArticleRequest).then((updatedArticle) => {
            expect(updatedArticle.title).to.equal(updateArticleRequest.title);
            expect(updatedArticle.content).to.equal(updateArticleRequest.content);
        });
    });

    it("should get articles", () => {
        return new NewsService(connection).getArticles({
            limit: 10,
            page: 1,
        }).then((articles) => {
            expect(articles).to.have.length(1);
        });
    });

    it("should get a single article", () => {
        return new NewsService(connection).getArticle({
            limit: 10,
            page: 1,
            articleId: testArticle.id
        }).then((article) => {
            expect(article.title).to.equal(testArticle.title);
        });
    });

    it("should delete an article", () => {
        const articleRepo = connection.getRepository(Article);

        return new NewsService(connection).deleteArticle(testArticle).then(() => {
            return articleRepo.count();
        }).then((count) => {
            expect(count).to.equal(0);
        });
    });
});