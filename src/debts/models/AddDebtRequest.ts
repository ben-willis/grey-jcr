export default interface AddDebtRequest {
    name: string;
    message?: string;
    link?: string;
    amount: number;
    username: string;
}