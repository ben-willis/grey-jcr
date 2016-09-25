var User = require('../../models/user.js');
var db = require('../../helpers/db');

var chai = require("chai")
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
chai.use(chaiAsPromised);

describe("Static User Methods", function() {
    beforeEach(function(done) {
        db('users').insert({
            username: "abcd12",
            email: "abcd@efg.com",
            name: "Abc Def"
        }).then(function() {
            done();
        })
    });

    afterEach(function(done) {
        db('users').del().then(function() {
            done();
        })
    })

    it("should create new users", function(done){
        User.create("fake13").catch(function(err) {
            expect(err.status).to.equal(400);
            done();
        })
    });

    it("should find users by username", function(done) {
        User.findByUsername('abcd12').then(function(user) {
            expect(user.username).to.equal("abcd12");
            expect(user.email).to.equal("abcd@efg.com");
            expect(user.name).to.equal("Abc Def");
            done();
        })
    });

    it("should authorize users", function() {
        User.authorize("fake12", "fake").catch(function(err) {
            expect(err.status).to.equal(401);
        })
    })

    it("should search for users", function() {
        return Promise.all([
            expect(User.search("abc")).to.eventually.have.length(1),
            expect(User.search("xyz")).to.eventually.have.length(0)
        ])
    })
})

describe('User Object', function() {
    var current_user = null;
    var fake_debt_id = null;
    var fake_position_id = null;

    beforeEach(function(done) {
        db('users').insert({
            username: "abcd12",
            email: "abcd@efg.com",
            name: "Abc Def"
        }).then(function() {
            return User.findByUsername('abcd12')
        }).then(function(user) {
            current_user = user;
            return db('debts').insert({
                name: "Test Debt",
                amount: 10,
                username: "abcd12"
            }).returning("id")
        }).then(function(debt_id){
            fake_debt_id = debt_id[0];
            return db('positions').insert({
                title: "Fake Position",
                slug: "Fake-Position",
                level: 5
            }).returning("id")
        }).then(function(position_id){
            fake_position_id = position_id[0];
            done();
        })
    });

    afterEach(function(done) {
        current_user = null;
        fake_debt_id = null;
        fake_position_id = null;
        db('users').del().then(function() {
            return db('debts').del();
        }).then(function() {
            return db('positions').del();
        }).then(function() {
            return db('user_positions').del();
        }).then(function() {
            done();
        });
    });

    it("should change its name", function(done) {
        current_user.changeName('Ghi Jkl').then(function() {
            expect(current_user.name).to.equal('Ghi Jkl');
            done();
        });
    });

    it("should delete itself", function(done) {
        current_user.delete().then(function() {
            return User.findByUsername('abcd12');
        }).catch(function(err) {
            expect(err.status).to.equal(400)
            done();
        });
    });

    it("should get its total debt and all debts", function(done) {
        current_user.getDebt().then(function(amount) {
            expect(amount).to.equal(10)
            return current_user.getDebts();
        }).then(function(debts) {
            expect(debts).to.have.length(1)
            done();
        });
    });

    it("should pay its debt", function(done) {
        current_user.payDebt({
            username: this.username,
            name: "Test Payment",
            amount: 10
        }).then(function() {
            return current_user.getDebt();
        }).then(function(amount) {
            expect(amount).to.equal(0);
            done();
        })
    });

    it("should delete a debt", function(done) {
        current_user.deleteDebtById(fake_debt_id).then(function() {
            return current_user.getDebt();
        }).then(function(amount) {
            expect(amount).to.equal(0);
            done();
        })
    });

    it("should add to its debt", function(done) {
        current_user.addDebt({
            username: this.username,
            name: "Test Debt 2",
            amount: 10
        }).then(function() {
            return current_user.getDebt();
        }).then(function(amount) {
            expect(amount).to.equal(20);
            done();
        })
    });

    it("should assign itself to a position", function(done) {
        current_user.assignPosition(fake_position_id).then(function() {
            return db('user_positions').select({
                username: current_user.username,
                position_id: fake_position_id
            })
        }).then(function(data){
            expect(data).to.have.length(1);
            done();
        })
    });

    it("should get all its positions", function(done) {
        db('user_positions').insert({
            username: current_user.username,
            position_id: fake_position_id
        }).then(function(){
            return current_user.getPositions();
        }).then(function(positions) {
            expect(positions).to.have.length(1);
            done();
        })
    });

    it("should remove itself from a position", function(done) {
        db('user_positions').insert({
            username: current_user.username,
            position_id: fake_position_id
        }).then(function(){
            return current_user.removePosition(fake_position_id)
        }).then(function() {
            return db('user_positions').select().where({
                username: current_user.username,
                position_id: fake_position_id
            })
        }).then(function(data){
            expect(data).to.have.length(0);
            done();
        })
    });

    it("should find all blog posts by itself");
})
