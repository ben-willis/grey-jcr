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
            })
        }).then(function(){
            done();
        })
    });

    afterEach(function(done) {
        current_user = null;
        db('users').del().then(function() {
            return db('debts').del();
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
        current_user.payDebt(10).then(function() {
            return current_user.getDebt();
        }).then(function(amount) {
            expect(amount).to.equal(0);
            done();
        })
    });

    it("should add to its debt", function(done) {
        current_user.addDebt(10).then(function() {
            return current_user.getDebt();
        }).then(function(amount) {
            expect(amount).to.equal(20);
            done();
        })
    });
})
