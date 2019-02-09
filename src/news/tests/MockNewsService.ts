import NewsClient from "../NewsClient";
import GetArticlesRequest from "../models/GetArticlesRequest";
import CreateArticleRequest from "../models/CreateArticleRequest";
import UpdateArticleRequest from "../models/UpdateArticleRequest";
import Article from "../entities/Article";

export default class MockNewsService extends NewsClient {
    constructor(private mockArticles: Article[]) {
        super();
    }

    async getArticles(req: GetArticlesRequest): Promise<Article[]> {
        return this.mockArticles.filter((article) => (
            (!req.articleId || article.id === req.articleId)
            && (!req.author || article.authorUsername === req.author)
            && (!req.query || article.title.indexOf(req.query) > -1)
            && (!req.roleId || article.roleId === req.roleId)
            && (!req.slug || article.slug === req.slug)
            && (!req.date || 
                (!req.date.day || article.updated.getDate() === req.date.day)
                && (req.date.month === article.updated.getMonth() + 1)
                && (req.date.year === article.updated.getFullYear())
            )
        )).slice((req.page - 1) * req.limit, req.page * req.limit);
    }

    async createArticle(createArticleRequest: CreateArticleRequest): Promise<Article> {
    return {
            id: 1,
            title: createArticleRequest.title,
            slug: createArticleRequest.title,
            content: createArticleRequest.content,
            updated: new Date(),
            roleId: createArticleRequest.roleId,
            authorUsername: createArticleRequest.author,
        };
    }

    async updateArticle(updateArticleRequest: UpdateArticleRequest): Promise<Article> {
        return {
            id: updateArticleRequest.articleId,
            title: updateArticleRequest.title,
            slug: "unchanged-slug",
            content: updateArticleRequest.content,
            updated: new Date(),
            roleId: 1,
            authorUsername: "abcd12",
        };
    }

    async deleteArticle(article: Article): Promise<void> {
        return;
    }
}