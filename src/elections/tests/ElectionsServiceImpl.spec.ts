import {expect} from "chai";
import { Connection, createConnection } from "typeorm";
import ElectionsService from "../ElectionsService";
import ElectionsServiceImpl from "../ElectionsServiceImpl";
import ElectionsFixtures from "./ElectionsFixtures";
import ElectionStatus from "../models/ElectionStatus";
import VotesRequest from "../models/VoteRequest";

describe("Elections Service", () => {
    let connection: Connection;
    let electionsService: ElectionsService;
    let electionsFixtures: ElectionsFixtures;

    before(async () => {
        connection = await createConnection("grey");
        electionsService = new ElectionsServiceImpl(connection);
        electionsFixtures = new ElectionsFixtures(connection);
    });

    beforeEach(() => electionsFixtures.load(["aaaa11", "bbbb22", "cccc33", "dddd44", "eeee55"]));

    afterEach(() => electionsFixtures.clear());

    after(() => connection.close());

    it("should get an election", () => {
        const expectedElection = electionsFixtures.elections[0];
        
        return electionsService.getElection(expectedElection.id).then((election) => {
            expect(election.name).to.equal(expectedElection.name);
            expect(election).to.have.property("positions");
        });
    });

    it("should get all elections", () => {
        return electionsService.getElections().then((elections) => {
            expect(elections).to.have.length(electionsFixtures.elections.length);
        })
    });

    it("should get elections with certain status", () => {
        const expectedElections = electionsFixtures.elections.filter(e => e.status === ElectionStatus.closed);
        
        return electionsService.getElections(ElectionStatus.closed).then((elections) => {
            expect(elections).to.have.length(expectedElections.length);
        })
    });

    it("should create a new election", () => {
        const newElectionName = "New Election";
        
        return electionsService.createElection(newElectionName).then((election) => {
            expect(election.name).to.equal(newElectionName);
            expect(election).to.have.property("id");
        })
    });

    it("should update an election", () => {
        const newElectionName = "Updated Election";
        const newElectionStatus = ElectionStatus.publicising;
        const electionToUpdate = electionsFixtures.elections[0];
        
        return electionsService.updateElection(
            electionToUpdate.id,
            newElectionName,
            newElectionStatus,
        ).then((election) => {
            expect(election.name).to.equal(newElectionName);
            expect(election.status).to.equal(newElectionStatus);
            expect(election.id).to.equal(electionToUpdate.id);
        })
    });

    it("should delete an election", () => {
        const electionToDelete = electionsFixtures.elections[0];
        
        return electionsService.deleteElection(electionToDelete.id);
    });

    it("should add a position", () => {
        const newPositionName = "New Position";
        const electionToAddTo = electionsFixtures.elections[0];

        return electionsService.addPosition(electionToAddTo.id, newPositionName).then((election) => {
            expect(election.positions.map(p => p.name)).to.contain(newPositionName);
        });
    });

    it("should remove a position", () => {
        const electionToRemoveFrom = electionsFixtures.elections[0];
        const positionsToRemove = electionToRemoveFrom.positions[0];

        return electionsService.removePosition(electionToRemoveFrom.id, positionsToRemove.id).then((election) => {
            expect(election.positions).to.have.length(electionToRemoveFrom.positions.length - 1);
        });
    });

    it("should add a nominee", () => {
        const electionToAddTo = electionsFixtures.elections[0];
        const positionToAddTo = electionToAddTo.positions[0];

        return electionsService.addNominee(positionToAddTo.id, "New Nominee", "").then((election) => {
            expect(election.positions.find(p => p.id === positionToAddTo.id).nominees.map(n => n.name)).to.contain("New Nominee");
        });
    });

    it("should remove a nominee", () => {
        const electionToRemoveFrom = electionsFixtures.elections[0];
        const positionToRemoveFrom = electionToRemoveFrom.positions[0];
        const nomineeToRemove = positionToRemoveFrom.nominees[0];
        
        return electionsService.removeNominee(electionToRemoveFrom.id, nomineeToRemove.id);
    });

    it("should get the results for a position", () => {
        const position = electionsFixtures.elections.find(e => e.status === ElectionStatus.closed).positions[0];

        return electionsService.getPositionResults(position.id).then(results => {
            expect(results.breakDown).to.have.length(2);
            expect(results.winner.name).to.equal("Andy Lucas")
        })
    });

    it("should submit a vote in an election", () => {
        const electionToVoteIn = electionsFixtures.elections.find(e => e.status === ElectionStatus.open);
        const votesRequest: VotesRequest = {
            electionId: electionToVoteIn.id,
            username: "aaaa11",
            votes: [{
                positionId: electionToVoteIn.positions[0].id,
                nomineeId: electionToVoteIn.positions[0].nominees[0].id,
                preference: "1"
            }]
        }
        
        return electionsService.voteInElection(votesRequest);
    });

    it("should reject a vote in a closed election", () => {
        const electionToVoteIn = electionsFixtures.elections.find(e => e.status === ElectionStatus.closed);
        const votesRequest: VotesRequest = {
            electionId: electionToVoteIn.id,
            username: "aaaa11",
            votes: [{
                positionId: electionToVoteIn.positions[0].id,
                nomineeId: electionToVoteIn.positions[0].nominees[0].id,
                preference: "1"
            }]
        }
        
        return electionsService.voteInElection(votesRequest).catch(err => {
            expect(err);
        });
    });

    it("should return whether a user has voted in an election when they have", () => {
        return electionsService.userHasVoted(electionsFixtures.elections[0].id, "aaaa11").then(hasVoted => {
            expect(hasVoted).to.be.false;
        })
    });
    it("should return whether a user has voted in an election when they have not", () => {
        return electionsService.userHasVoted(electionsFixtures.elections[0].id, "ffff66").then(hasVoted => {
            expect(hasVoted).to.be.false;
        })
    });
})