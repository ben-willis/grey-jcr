import Vote from "./entities/Vote";
import Position from "./entities/Position";
import Nominee from "./entities/Nominee";
import PositionResults from "./models/PositionResults";
import ElectionRound from "./models/ElectionRound";

export function getPositionWinner(position: Position, nominees: Nominee[], votes: Vote[], roundsResults: ElectionRound[]): PositionResults {
    const firstChoiceVotes = votes.filter(v => v.preference === 1);

    const electionRound = getElectionRound(nominees, firstChoiceVotes);
    roundsResults.push(electionRound);

    if (electionRound.winner) {
        return {
            position,
            winner: electionRound.winner,
            breakDown: roundsResults
        }
    } else {
        const [remainingNominees, newVotes] = getNomineesAndVotesWithoutLooser(nominees, votes, electionRound.loser);

        return getPositionWinner(position, remainingNominees, newVotes, roundsResults);
    }
}

function getElectionRound(nominees: Nominee[], votes: Vote[]): ElectionRound {
    const nomineeElectionRounds = nominees.map((nominee) => {
        const nomineeVotes = votes.filter((vote) => {
            return vote.nominee.id === nominee.id;
        });

        return {nominee, votes: nomineeVotes.length};
    });

    const totalVotes = votes.length;
    const threshold = Math.floor(totalVotes / 2) + 1;
    const winner = getWinner(nomineeElectionRounds, threshold);
    const loser = winner ? undefined : getLoser(nomineeElectionRounds);

    return {
        nomineeElectionRounds,
        totalVotes,
        threshold,
        winner,
        loser,
    };
}

function getWinner(nomineeElectionRounds: Array<{nominee: Nominee, votes: number}>, threshold: number): Nominee {
    const winner = nomineeElectionRounds.filter((nomineeRoundResult) => {
        return nomineeRoundResult.votes >= threshold;
    });

    if (winner.length > 2) {
        // TODO: Add multiple winners handling
        return winner.pop().nominee;
    }

    if (winner.length === 1) {
        return winner.pop().nominee;
    }

    return;
}

function getNomineesAndVotesWithoutLooser(nominees: Nominee[], votes: Vote[], loser: Nominee): [Nominee[], Vote[]] {
    const usersEliminatedChoices = new Map();
    const remainingNominees = nominees.filter((nominee) => nominee.id !== loser.id);

    // Remove losers votes
    const votesWithoutLoser = votes.filter((vote) => {
        if (vote.nominee.id === loser.id) {
            usersEliminatedChoices.set(vote.username, vote.preference);

            return false;
        }

        return true;
    });

    // Reduce the preference of votes a users other votes if one of their votes has been removed
    const votesWithUpdatedPreferences = votesWithoutLoser.map((vote) => {
        if (usersEliminatedChoices.has(vote.username) && usersEliminatedChoices.get(vote.username) < vote.preference) {
            vote.preference = --vote.preference;
        }

        return vote;
    });

    return [remainingNominees, votesWithUpdatedPreferences];
}

function getLoser(nomineeElectionRounds: Array<{nominee: Nominee, votes: number}>): Nominee {
    if (nomineeElectionRounds.length === 0) { throw Error("No nominees to choose loser from"); }

    const minVotes = Math.min.apply(
        Math,
        nomineeElectionRounds.map((nomineeElectionRound) => nomineeElectionRound.votes),
    );

    const losers = nomineeElectionRounds.filter((nomineeElectionRound) => nomineeElectionRound.votes === minVotes);

    if (losers.length > 1) {
        // TODO: Implement multiple losers
    }

    return losers.pop().nominee;
}
