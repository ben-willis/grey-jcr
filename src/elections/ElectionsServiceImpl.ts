import { Connection, Repository } from 'typeorm';
import Election from './entities/Election';
import Vote from './entities/Vote';
import Position from './entities/Position';
import Nominee from './entities/Nominee';
import ElectionStatus from './models/ElectionStatus';
import ElectionsService from './ElectionsService';
import PositionResults from './models/PositionResults';
import VoteRequest from "./models/VoteRequest";
import md5 from "md5";
import { getPositionWinner } from './ResultsCalculator';

export default class ElectionsServiceImpl implements ElectionsService {
    private electionsRepo: Repository<Election>;
    private votesRepo: Repository<Vote>;
    private nomineesRepo: Repository<Nominee>;
    private positionsRepo: Repository<Position>;
    
    constructor(connection: Connection) {
        this.electionsRepo = connection.getRepository(Election);
        this.votesRepo = connection.getRepository(Vote);
        this.nomineesRepo = connection.getRepository(Nominee);
        this.positionsRepo = connection.getRepository(Position);
    }

    async getElection(electionId: number): Promise<Election> {
        return this.electionsRepo.findOne(electionId);
    }

    async getElections(status?: ElectionStatus): Promise<Election[]> {
        if (typeof status !== "undefined") {
            return this.electionsRepo.find({
                where: { status }
            });
        } else {
            return this.electionsRepo.find();
        }
    }

    async createElection(name: string): Promise<Election> {
        const election = new Election();
        election.name = name;

        return this.electionsRepo.save(election);
    }

    async updateElection(electionId: number, name: string, status: ElectionStatus): Promise<Election> {
        const election = await this.electionsRepo.findOneOrFail(electionId);
        election.name = name;
        election.status = status;

        return this.electionsRepo.save(election);
    }

    async deleteElection(electionId: number): Promise<void> {
        return this.electionsRepo.delete(electionId).then(() => null);
    }

    async addPosition(electionId: number, name: string): Promise<Election> {
        const position = new Position();
        position.name = name;
        position.election = await this.electionsRepo.findOne(electionId);
        await this.positionsRepo.save(position);

        return this.electionsRepo.findOne(electionId);
    }

    async removePosition(electionId: number, positionsId: number): Promise<Election> {
        await this.positionsRepo.delete(positionsId);

        return this.electionsRepo.findOne(electionId);
    }

    async addNominee(positionId: number, name: string, manifesto: string): Promise<Election> {
        const position = await this.positionsRepo.findOne(positionId, {relations: ["election"]});
        const nominee = new Nominee();
        nominee.name = name;
        nominee.manifesto = manifesto;
        nominee.position = position;
        await this.nomineesRepo.save(nominee);

        return this.electionsRepo.findOne(position.election.id);
    }

    async removeNominee(electionId: number, nomineeId: number): Promise<void> {
        return this.nomineesRepo.delete(nomineeId).then(() => null);
    }
    
    async getPositionResults(positionId: number): Promise<PositionResults> {
        const position = await this.positionsRepo.findOneOrFail(positionId);
        const votes = await this.votesRepo.find({where: {position}, relations: ["nominee"]}).then(this.cleanseVotes);

        return getPositionWinner(position, position.nominees, votes, []);
    }

    private cleanseVotes(votes: Vote[]): Vote[] {
        return votes.map(v => {
            v.preference = Number(v.rawPreference);
            return v;
        }).filter(v => (v.preference % 1 === 0  && v.preference > 0));
    };
    
    async voteInElection(voteRequest: VoteRequest): Promise<Vote[]> {
        const election = await this.electionsRepo.findOne(voteRequest.electionId);
        await this.validateVoteRequest(election, voteRequest);
        
        return Promise.all(voteRequest.votes.map(v => this.createVoteEntity(
            election,
            v.positionId,
            v.nomineeId,
            v.preference,
            voteRequest.username
        )))
    }

    private validateVoteRequest(election: Election, voteRequest: VoteRequest): void {
        if (election.status !== ElectionStatus.open) {
            throw new Error(`Election '${election.name}' is not open for voting`);
        }

        voteRequest.votes.map(v => {
            const positionsInElection = election.positions.map(p => p.id);
            const nomineesInElection = election.positions.map(p => p.nominees).reduce((a, b) => a.concat(b)).map(n => n.id);
            if (positionsInElection.indexOf(v.positionId) === -1) {
                throw new Error("Vote request contains position not in election");
            }
            if (nomineesInElection.indexOf(v.nomineeId) === -1) {
                throw new Error("Vote request contains nominee not in election");
            };
        });
    }

    private async createVoteEntity(election: Election, positionId: number, nomineeId: number, preference: string, username: string): Promise<Vote> {
        const position = await this.positionsRepo.findOne(positionId);
        const nominee = await this.nomineesRepo.findOne(nomineeId);

        const vote = new Vote();
        vote.election = election;
        vote.position = position;
        vote.nominee = nominee;
        vote.rawPreference = preference;
        vote.usercode = md5(username);
        vote.username = username;

        return this.votesRepo.save(vote);
    }
    
    async userHasVoted(electionId: number, username: string): Promise<boolean> {
        const election = await this.electionsRepo.findOne(electionId);
        const userVotesCount = await this.votesRepo.count({where: {election, username}});
    
        return userVotesCount > 0;
    }
}
