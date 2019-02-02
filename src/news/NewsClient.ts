import httpError from "http-errors";

import Article from "./entities/Article";

import CreateArticleRequest from "./models/CreateArticleRequest";
import GetArticlesRequest from "./models/GetArticlesRequest";
import UpdateArticleRequest from "./models/UpdateArticleRequest";

export default abstract class NewsClient {

    async getArticle(getArticlesRequest: GetArticlesRequest): Promise<Article> {
        const articles = await this.getArticles(getArticlesRequest);
        if (articles.length === 0) {
            throw httpError(404, "Article not found");
        } else {
            return articles[0];
        }
    }

    abstract getArticles(getArticlesRequest: GetArticlesRequest): Promise<Article[]>;

    abstract createArticle(createArticleRequest: CreateArticleRequest): Promise<Article>;

    abstract updateArticle(updateArticleRequest: UpdateArticleRequest): Promise<Article>;

    abstract deleteArticle(article: Article): Promise<void>;

}