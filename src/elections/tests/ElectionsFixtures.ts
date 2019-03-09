import Election from "../entities/Election";
import { Repository, Connection } from "typeorm";
import Position from "../entities/Position";
import Nominee from "../entities/Nominee";
import Vote from "../entities/Vote";
import ElectionStatus from "../models/ElectionStatus";

export default class ElectionsFixtures {
    public elections: Election[];

    private electionsRepo: Repository<Election>;
    private positionsRepo: Repository<Position>;
    private nomineesRepo: Repository<Nominee>;
    private votesRepo: Repository<Vote>;

    constructor(connection: Connection) {
        this.elections = [];

        this.electionsRepo = connection.getRepository(Election);
        this.positionsRepo = connection.getRepository(Position);
        this.nomineesRepo = connection.getRepository(Nominee);
        this.votesRepo = connection.getRepository(Vote);
    }

    public async load(usernames: string[]): Promise<void> {
        if (usernames.length < 5) {
            throw new Error("Must provide at least 5 valid usernames for votes fixtures");
        }

        const openElection = await this.electionsRepo.save({name: "Open Election", status: ElectionStatus.open});
        const publicisingElection = await this.electionsRepo.save({name: "Publicising Election", status: ElectionStatus.publicising});
        const closedElection = await this.electionsRepo.save({name: "Closed Election", status: ElectionStatus.closed});
    
        const president = await this.positionsRepo.save({election: openElection, name: "President"});
        const facso = await this.positionsRepo.save({election: closedElection, name: "FACSO"});

        const presidentCandidate1 = await this.nomineesRepo.save({position: president, name: "John Oliver"});
        const presidentCandidate2 = await this.nomineesRepo.save({position: president, name: "RON"});
        const facsoCandidate1 = await this.nomineesRepo.save({position: facso, name: "Andy Lucas"});
        const facsoCandidate2 = await this.nomineesRepo.save({position: facso, name: "Will Hockedy"});
        const facsoCandidate3 = await this.nomineesRepo.save({position: facso, name: "RON"});

        const votes = await Promise.all([
            {position: facso, nominee: facsoCandidate1, election: closedElection, rawPreference: "1", usercode: "a", username: usernames[0]},
            {position: facso, nominee: facsoCandidate2, election: closedElection, rawPreference: "2", usercode: "a", username: usernames[0]},
            {position: facso, nominee: facsoCandidate3, election: closedElection, rawPreference: "3", usercode: "a", username: usernames[0]},
            {position: facso, nominee: facsoCandidate1, election: closedElection, rawPreference: "1", usercode: "b", username: usernames[1]},
            {position: facso, nominee: facsoCandidate2, election: closedElection, rawPreference: "1", usercode: "c", username: usernames[2]},
            {position: facso, nominee: facsoCandidate1, election: closedElection, rawPreference: "2", usercode: "c", username: usernames[2]},
            {position: facso, nominee: facsoCandidate3, election: closedElection, rawPreference: "1", usercode: "d", username: usernames[3]},
            {position: facso, nominee: facsoCandidate1, election: closedElection, rawPreference: "2", usercode: "d", username: usernames[3]},
            {position: facso, nominee: facsoCandidate2, election: closedElection, rawPreference: "1", usercode: "e", username: usernames[4]},
        ].map(v => this.votesRepo.save(v)));

        this.elections = await this.electionsRepo.find();
    }

    public async clear(): Promise<void> {
        await this.votesRepo.delete({});
        await this.nomineesRepo.delete({});
        await this.positionsRepo.delete({});
        await this.electionsRepo.delete({});
    }
}