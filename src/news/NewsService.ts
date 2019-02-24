import RoleService from './../roles/RoleService';
import slugify from "slugify";
import { Connection } from "typeorm";
import GetArticlesRequest from "./models/GetArticlesRequest";
import UpdateArticleRequest from "./models/UpdateArticleRequest";

import Article from "./entities/Article";
import CreateArticleRequest from "./models/CreateArticleRequest";
import NewsClient from "./NewsClient";

import User from "../models/user";

export default class NewsService extends NewsClient {
    constructor(private dbConnection: Connection, private roleService: RoleService) {
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

        return articleRepo.save(article).then(a => this.populateArticleUserRole(a));
    }

    async updateArticle(updateArticleRequest: UpdateArticleRequest): Promise<Article> {
        const articleRepo = this.dbConnection.getRepository(Article);
        const article = await articleRepo.findOneOrFail(updateArticleRequest.articleId);
    
        article.title = updateArticleRequest.title;
        article.content = updateArticleRequest.content;
    
        return articleRepo.save(article).then(a => this.populateArticleUserRole(a));
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
    
        if (getArticlesRequest.onDate) {
            articleQuery = articleQuery
                .andWhere("EXTRACT(YEAR FROM article.updated) = :year", { year: getArticlesRequest.onDate.year})
                .andWhere("EXTRACT(MONTH FROM article.updated) = :month", { month: getArticlesRequest.onDate.month});
        }

        if (getArticlesRequest.sinceTime) {
            const epochSinceTime = (getArticlesRequest.sinceTime instanceof Date)
                ? getArticlesRequest.sinceTime.getTime()
                : getArticlesRequest.sinceTime

            articleQuery = articleQuery
                .andWhere("EXTRACT(EPOCH FROM article.updated) > :time", {time: ~~(epochSinceTime / 1000)})
        }
    
        const articles = await articleQuery.orderBy("updated", "DESC").getMany();
    
        return Promise.all(articles.map(a => this.populateArticleUserRole(a)));
    }

    async deleteArticle(article: Article): Promise<void> {
        const articleRepo = this.dbConnection.getRepository(Article);
        return articleRepo.delete(article.id).then(() => null);
    }

    private async populateArticleUserRole(article: Article): Promise<Article> {
        const author = await User.findByUsername(article.authorUsername).catch((err) => {
            if (err.status === 404) {
                return {
                    username: article.authorUsername,
                    name: "Unknown",
                    email: "Unknown"
                }
            } else throw err;
        });

        const role = await this.roleService.getRoleById(article.roleId).catch(err => {
            if (err.name === "EntityNotFound") {
                return {
                    id: article.roleId,
                    title: "Unknown",
                    slug: "unknown"
                }
            }
        });
    
        article.role = role;
        article.author = author;
    
        return article;
    }
}
