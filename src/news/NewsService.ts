import slugify from "slugify";
import { Connection } from "typeorm";
import GetArticlesRequest from "./models/GetArticlesRequest";
import UpdateArticleRequest from "./models/UpdateArticleRequest";

import Article from "./entities/Article";
import CreateArticleRequest from "./models/CreateArticleRequest";
import NewsClient from "./newsClient";

import User from "../models/user";
import Role from "../models/role";

export default class NewsService extends NewsClient {
    constructor(private dbConnection: Connection) {
        super();
    };

    async createArticle(createArticleRequest: CreateArticleRequest): Promise<Article> {
        const articleRepo = this.dbConnection.getRepository(Article);
        // TODO: Reject empty strings
        const article = articleRepo.create({
            title: createArticleRequest.title,
            slug: slugify(createArticleRequest.title, {lower: true}),
            content: createArticleRequest.content,
            authorUsername: createArticleRequest.author,
            roleId: createArticleRequest.roleId,
        });

        return articleRepo.save(article).then(this.populateArticleUserRole);
    }

    async updateArticle(updateArticleRequest: UpdateArticleRequest): Promise<Article> {
        const articleRepo = this.dbConnection.getRepository(Article);
        const article = await articleRepo.findOneOrFail(updateArticleRequest.articleId);
    
        article.title = updateArticleRequest.title;
        article.content = updateArticleRequest.content;
    
        return articleRepo.save(article).then(this.populateArticleUserRole);
    }

    async getArticles(getArticlesRequest: GetArticlesRequest): Promise<Article[]> {
        const articleRepo = this.dbConnection.getRepository(Article);
        let articleQuery = articleRepo.createQueryBuilder("article");
    
        articleQuery = articleQuery
            .skip(getArticlesRequest.limit * (getArticlesRequest.page - 1))
            .take(getArticlesRequest.limit);
    
        if (getArticlesRequest.query) {
            articleQuery = articleQuery
                .andWhere("LOWER(article.title) LIKE '%' || LOWER(:query) || '%'", {query: getArticlesRequest.query});
        }
    
        if (getArticlesRequest.articleId) {
            articleQuery = articleQuery
                .andWhere("article.id = :id", {id: getArticlesRequest.articleId});
        }
    
        if (getArticlesRequest.author) {
            articleQuery = articleQuery
                .andWhere("article.author = :author", {author: getArticlesRequest.author});
        }
    
        if (getArticlesRequest.roleId) {
            articleQuery = articleQuery
                .andWhere("article.role_id = :roleId", {roleId: getArticlesRequest.roleId});
        }
    
        if (getArticlesRequest.slug) {
            articleQuery = articleQuery
                .andWhere("article.slug = :slug", {slug: getArticlesRequest.slug});
        }
    
        if (getArticlesRequest.date) {
            articleQuery = articleQuery
                .andWhere("EXTRACT(YEAR FROM updated) = :year", { year: getArticlesRequest.date.year})
                .andWhere("EXTRACT(MONTH FROM updated) = :month", { month: getArticlesRequest.date.month});
        }
    
        const articles = await articleQuery.getMany();
    
        return Promise.all(articles.map(this.populateArticleUserRole));
    }

    async deleteArticle(article: Article): Promise<void> {
        const articleRepo = this.dbConnection.getRepository(Article);
        return articleRepo.delete(article.id).then(() => null);
    }

    private async populateArticleUserRole(article: Article): Promise<Article> {
        const author = await User.findByUsername(article.authorUsername);
        const role = await Role.findById(article.roleId);
    
        article.role = role;
        article.author = author;
    
        return article;
    }
}
