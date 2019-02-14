interface DateFilter {
    day?: number;
    month: number;
    year: number;
}

export default interface GetArticlesRequest {
    page: number;
    limit: number;
    articleId?: number;
    onDate?: DateFilter;
    sinceTime?: number | Date;
    slug?: string;
    query?: string;
    author?: string;
    roleId?: number;
}