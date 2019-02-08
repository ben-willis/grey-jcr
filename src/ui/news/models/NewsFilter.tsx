interface DateFilter {
    month: number;
    year: number;
}

export default interface NewsFilter {
    month?: number;
    year?: number;
    query?: string;
    author?: string;
    roleId?: number;
}