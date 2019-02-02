interface DateFilter {
    day?: number;
    month: number;
    year: number;
}

export default interface GetArticlesRequest {
    page: number;
    limit: number;
    articleId?: number;
    date?: DateFilter;
    slug?: string;
    query?: string;
    author?: string;
    roleId?: number;
}