var db = require('../helpers/db');
var httpError = require('http-errors');
var shortid = require('shortid');

/* Election Object*/
var Election = function (data) {
    this.id = data.id;
    this.status = data.status;
    this.name = data.name;
    this.positions = [];
};

Election.prototype.update = function(name, status) {
    return db('elections').update({
        name: name,
        status: status
    }).where({id: this.id}).then(function(){
        this.name = name;
        this.status = status;
        return;
    }.bind(this));
};

Election.prototype.delete = function () {
    return db('elections').del().where({id: this.id});
};

Election.prototype.getPositions = function() {
    return db('election_positions').select('name', 'id').where({election_id: this.id}).then(function(positions) {
        return Promise.all(
            positions.map(function(position) {
                return db('election_position_nominees').select('id', 'name', 'manifesto').where({position_id: position.id}).then(function(nominees){
                    position.nominees = nominees;
                    return position;
                });
            })
        );
    });
};

Election.prototype.addPosition = function(position_name) {
    return db('election_positions').insert({
        name: position_name,
        election_id: this.id
    }).returning('id').then(function(ids){
        this.positions.push({
            name: position_name,
            id: ids[0],
            nominees: []
        });
        return;
    }.bind(this));
};

Election.prototype.removePosition = function(position_id) {
    return db('election_positions').del().where({
        id: position_id
    }).returning('id').then(function(ids){
        for (var i = 0; i < this.positions.length; i++) {
            if(this.positions[i].id == position_id) {
                this.positions.splice(i, 1);
            }
        }
        return;
    }.bind(this));
};

Election.prototype.addNominee = function(position_id, nominee_name, manifesto) {
    return db('election_position_nominees').insert({
        name: nominee_name,
        manifesto: manifesto,
        position_id: position_id
    }).returning('id').then(function(ids){
        this.positions.forEach(function(position){
            if (position.id == position_id) {
                position.nominees.push({
                    id: ids[0],
                    name: nominee_name,
                    manifest: manifesto
                });
            }
        });
    }.bind(this));
};

Election.prototype.removeNominee = function(nominee_id) {
    return db('election_position_nominees').del().where({id: nominee_id}).then(function() {
        this.positions.forEach(function(position) {
            position.nominees = position.nominees.filter(function(nominee) {
                return nominee.id != nominee_id;
            });
        });
    }.bind(this));
};

Election.prototype.castVote = function(username, position_id, votes) {
    // Should probably check election is open and what not
    var usercode = shortid.generate();
    return Promise.all(
        votes.map(function(vote){
            return db('election_votes').insert({
                election_id: this.id,
                position_id: position_id,
                nominee_id: vote.nominee_id,
                preference:vote.preference,
                usercode: usercode,
                username: username
            });
        }.bind(this))
    );
};

Election.prototype.getFirstPreference = function(ballot) {
    var firstPreferenceVote = ballot.filter(function(vote) {
        return vote.preference == 1;
    }).shift();
    return firstPreferenceVote.nominee_id;
};

Election.prototype.cleanseBallot = function(ballot) {
    var preference_counts = {};
    // filter out non integers and non negatives
    for (i = ballot.length-1; i>-1; i--) {
        var preference = ballot[i].preference;
        if (!(preference % 1 === 0  && preference > 0)) {
            ballot.splice(i, 1);
        } else {
            preference_counts[preference] = preference_counts[preference] ? preference_counts[preference]+1 : 1;
        }
    }
    // Filter out repeats
    for (i = ballot.length-1; i>-1; i--) {
        if (preference_counts[ballot[i].preference] != 1){
            ballot.splice(i, 1);
        }
    }
    // Now we need to check votes are consecutive, first we sort
    ballot.sort(function(vote_a, vote_b) {
        return vote_a.preference - vote_b.preference;
    });
    // And then we run through checking order
    for (i = 0; i < ballot.length; i++) {
        if (ballot[i].preference != i+1) {
            ballot.splice(i);
            break;
        }
    }
    return ballot;
};

Election.prototype.getBallotsByPosition = function(position_id) {
    return db('election_votes')
        .select('nominee_id', 'preference', 'usercode')
        .where({position_id: position_id})
        .orderBy('usercode')
        .then(function(votes){
            var ballots = [];
            var current_ballot = [];
            var current_user = votes[0].usercode;
            for (var vote of votes) {
                if (vote.usercode != current_user) {
                    ballots.push(current_ballot);
                    current_ballot = [];
                    current_user = vote.usercode;
                }
                current_ballot.push({
                    nominee_id: vote.nominee_id,
                    preference: vote.preference
                });
            }
            ballots.push(current_ballot);
            return ballots;
        });
};

/* Static Election Methods */

Election.create = function(election_name) {
    return db('elections').insert({
        name: election_name
    }).returning('id').then(function(ids) {
        return new Election({
            name: election_name,
            status: 0,
            id: ids[0]
        });
    });
};

Election.findById = function(election_id) {
    var election;
    return db('elections').first().where({id: election_id}).then(function(data){
        if (!data) return httpError(404, "Election not found");
        election = new Election(data);
        return election.getPositions();
    }).then(function(positions) {
        election.positions = positions;
        return election;
    });
};

Election.getByStatus = function(status) {
    return db('elections').select().where({status: status}).then(function(elections) {
        return Promise.all(
            elections.map(function(election_data) {
                var election = new Election(election_data);
                return election.getPositions().then(function(positions) {
                    election = new Election(election_data);
                    election.positions = positions;
                    return election;
                });
            })
        );
    });
};

module.exports = Election;

/* Election Structure

Election
 |_ id: (int)
 |_ name: (string)
 |_ status: 0- closed, 1- public, 2- open (int)
 |_ positions
 |   |_ id: (int)
 |   |_ election_id: election reference(int)
 |   |_ name: (string)
 |   |_ nominees
 |       |_ id: (int)
 |       |_ position_id: position reference (int)
 |       |_ name: (string)
 |_ ballots
     |_ id: (int)
     |_ position_id: position reference (int)
     |_ votes
         |_ nominee_id: nominee reference (int)
         |_ preference: (char)
         .
         .
         .


*/
