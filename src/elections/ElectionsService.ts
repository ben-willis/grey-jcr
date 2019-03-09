import Election from "./entities/Election";
import ElectionStatus from "./models/ElectionStatus";
import Vote from "./entities/Vote";
import VoteRequest from "./models/VoteRequest";
import PositionResults from "./models/PositionResults";

export default interface ElectionsService {
    getElection(electionId: number): Promise<Election>;
    getElections(status?: ElectionStatus): Promise<Election[]>;
    createElection(name: string): Promise<Election>;
    updateElection(electionId: number, name: string, status: ElectionStatus): Promise<Election>;
    deleteElection(electionId: number): Promise<void>;
    addPosition(electionId: number, name: string): Promise<Election>;
    removePosition(electionId: number, positionId: number): Promise<Election>;
    addNominee(positionId: number, name: string, manifesto: string): Promise<Election>;
    removeNominee(electionId: number, nomineeId: number): Promise<void>;
    getPositionResults(positionId: number): Promise<PositionResults>;
    voteInElection(voteRequest: VoteRequest): Promise<Vote[]>;
    userHasVoted(electionId: number, username: string): Promise<boolean>;
}