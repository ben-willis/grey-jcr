export default interface VotesRequest {
    electionId: number;
    username: string;
    votes: Array<{
        positionId: number
        nomineeId: number
        preference: number,
    }>;
}