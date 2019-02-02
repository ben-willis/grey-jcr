import express from "express";

import httpError from "http-errors";

import NewsClient from "./newsClient";

export default function getNewsRouter(newsClient: NewsClient, routerOptions?: express.RouterOptions) {
    const newsRouter = express.Router(routerOptions);

    newsRouter.get("/", (req, res, next) => {
        newsClient.getArticles({
            page: Number(req.query.page || 1),
            limit: Number(req.query.limit || 10),
            query: req.query.q,
        }).then((articles) => res.json(articles)).catch(next);
    });
    
    newsRouter.get("/:year/:month/:day/:slug", (req, res, next) => {
        newsClient.getArticle({
            page: 1,
            limit: 1,
            date: {
                year: req.params.year,
                month: req.params.month,
                day: req.params.day,
            },
            slug: req.params.slug,
        }).then((article) =>  res.json(article)).catch(next);
    });
    
    newsRouter.post("/", (req, res, next) => {
        if (!req.user || req.user.level < 3) {
            throw httpError(403);
        }
    
        newsClient.createArticle({
            title: req.body.title,
            content: req.body.content,
            author: req.user.username,
            roleId: req.body.roleId,
        }).then((article) => res.json(article)).catch(next);
    });
    
    newsRouter.put("/:articleId", (req, res, next) => {
        if (!req.user || req.user.level < 3) {
            throw httpError(403);
        }
    
        newsClient.updateArticle({
            articleId: req.params.articleId,
            title: req.body.title,
            content: req.body.content,
        }).then((article) => res.send(article)).catch(next);
    });
    
    newsRouter.delete("/:articleId", (req, res, next) => {
        if (!req.user || req.user.level < 3) {
            throw httpError(403);
        }
    
        newsClient.getArticle({
            page: 1,
            limit: 1,
            articleId: Number(req.params.articleId),
        }).then(newsClient.deleteArticle).then(() => res.send()).catch(next);
    });

    return newsRouter;
}