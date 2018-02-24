var Election = require('../../models/election');
var db = require('../../helpers/db');

var expect = require("chai").expect;

describe('Static Election Methods', function() {
    var test_election_id = null;

    beforeEach(function(done) {
        db('elections').insert({name: "Test Election"}).returning('id').then(function(ids) {
            test_election_id = ids[0];
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    afterEach(function(done){
        db('elections').del().then(function() {
            test_election_id = null;
            done();
        });
    });

    it("can create an election", function(done) {
        Election.create('New Fake Election').then(function(election) {
            expect(election.id).to.not.be.undefined;
            expect(election.name).to.equal('New Fake Election');
            return db('elections').select();
        }).then(function(elections) {
            expect(elections).to.have.length(2);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("can find an election by id", function(done) {
        Election.findById(test_election_id).then(function(election){
            expect(election.name).to.equal("Test Election");
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("can get elections by status", function(done) {
        db('elections').insert({name: "Test Election"}).then(function(){
            return Election.getByStatus(0);
        }).then(function(elections){
            expect(elections).to.have.length(2);
        }).then(function() {
            return Election.getByStatus(1);
        }).then(function(elections){
            expect(elections).to.have.length(0);
            done();
        }).catch(function(err) {
            done(err);
        });
    });
});

describe('Election Object', function() {
    var test_election = null;

    beforeEach(function(done) {
        db('elections').insert({name: "Test Election"}).returning('id').then(function(ids) {
            test_election = new Election({
                id: ids[0],
                status: 0,
                name: "Test Election"
            })
            done();
        }).catch(function(err) {
            done(err);
        })
    })

    afterEach(function(done) {
        Promise.all([
            db('elections').del(),
            db('election_positions').del(),
            db('election_position_nominees').del(),
            db('election_votes').del()
        ]).then(function() {
            test_election = null;
            done();
        })
    })

    it("can update its name and status", function(done) {
        test_election.update("New Name", 1).then(function() {
            expect(test_election.status).to.equal(1);
            return db('elections').first().where({id: test_election.id});
        }).then(function(election_data){
            expect(election_data.name).to.equal("New Name");
            done();
        }).catch(function(err) {
            done(err);
        })
    })
    it("can delete itself", function(done){
        test_election.delete().then(function() {
            return db('elections').select();
        }).then(function(elections){
            expect(elections).to.have.length(0);
            done();
        }).catch(function(err) {
            done(err);
        })
    });

    it("can add and remove positions", function(done) {
        var test_position_id = null;
        test_election.addPosition("Test position").then(function() {
            expect(test_election.positions).to.have.length(1);
            test_position_id = test_election.positions[0].id;
            return db('election_positions').select();
        }).then(function(election_positions){
            expect(election_positions).to.have.length(1);
            return test_election.removePosition(test_position_id);
        }).then(function(){
            expect(test_election.positions).to.have.length(0);
            test_position_id = null;
            return db('election_positions').select();
        }).then(function(election_positions){
            expect(election_positions).to.have.length(0);
            done();
        }).catch(function(err) {
            done(err);
        })
    });

    it("can add and remove nominees to a position", function(done) {
        var test_nominee_id;
        test_election.addPosition("Fake Position").then(function(){
            return test_election.addNominee(test_election.positions[0].id, "Fake Nominee", "Fake Manifesto");
        }).then(function(){
            expect(test_election.positions[0].nominees).to.have.length(1);
            test_nominee_id = test_election.positions[0].nominees[0].id;
            return db('election_position_nominees').select();
        }).then(function(nominees) {
            expect(nominees).to.have.length(1);
            return test_election.removeNominee(test_nominee_id);
        }).then(function(){
            expect(test_election.positions[0].nominees).to.have.length(0);
            test_nominee_id = null;
            return db('election_position_nominees').select();
        }).then(function(nominees){
            expect(nominees).to.have.length(0);
            done();
        }).catch(function(err) {
            done(err);
        })
    });

    it("can get positions and nominees", function(done){
        test_election.addPosition("Fake Position").then(function(){
            return test_election.addNominee(test_election.positions[0].id, "Fake Nominee", "Fake Manifesto");
        }).then(function(){
            return test_election.getPositions();
        }).then(function(positions){
            expect(positions).to.have.length(1);
            expect(positions[0].nominees).to.have.length(1);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    xit("can cast votes", function(done) {
        test_election.castVote("hsdz38", 1, [
            {nominee_id: 1, preference: 'a'},
            {nominee_id: 2, preference: 0},
        ]).then(function(){
            return db('election_votes').select();
        }).then(function(votes) {
            expect(votes).to.have.length(2);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("can get votes by position");

    it("can cleanse a ballot (tidy up preferences)", function(){
        var test_ballot_1 = [
            {nominee_id: 1, preference: 'a'},
            {nominee_id: 1, preference: 0.5},
            {nominee_id: 1, preference: 0}
        ];
        var test_ballot_2 = [
            {nominee_id: 1, preference: 1},
            {nominee_id: 2, preference: 2},
            {nominee_id: 3, preference: 4}
        ];
        var test_ballot_3 = [
            {nominee_id: 1, preference: 1},
            {nominee_id: 2, preference: 2},
            {nominee_id: 3, preference: 2}
        ];
        var test_ballot_4 = [
            {nominee_id: 1, preference: 1},
            {nominee_id: 2, preference: 2},
            {nominee_id: 3, preference: 1},
            {nominee_id: 4, preference: 2}
        ];

        var cleansed_ballot_1 = test_election.cleanseBallot(test_ballot_1);
        var cleansed_ballot_2 = test_election.cleanseBallot(test_ballot_2);
        var cleansed_ballot_3 = test_election.cleanseBallot(test_ballot_3);
        var cleansed_ballot_4 = test_election.cleanseBallot(test_ballot_4);

        expect(cleansed_ballot_1).to.have.length(0);
        expect(cleansed_ballot_2).to.have.length(2);
        expect(cleansed_ballot_3).to.have.length(1);
        expect(cleansed_ballot_4).to.have.length(0);
    });
    it("can find first preference");
})
