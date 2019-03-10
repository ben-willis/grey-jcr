import Nominee from "../entities/Nominee";

export default interface ElectionRound {
    nomineeElectionRounds: Array<{nominee: Nominee, votes: number}>;
    totalVotes: number;
    threshold: number;
    winner?: Nominee;
    loser?: Nominee;
}