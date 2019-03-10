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
    });
})

describe('User Object', function() {
    var current_user = null;
    var fake_debt_id = null;
    var fake_role_id = null;

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
            return db('roles').insert({
                title: "Fake Role",
                slug: "Fake-Role",
                description: "",
                level: 5
            }).returning("id")
        }).then(function(role_id){
            fake_role_id = role_id[0];
            done();
        })
    });

    afterEach(function(done) {
        current_user = null;
        fake_debt_id = null;
        fake_role_id = null;
        db('users').del().then(function() {
            return db('debts').del();
        }).then(function() {
            return db('roles').del();
        }).then(function() {
            return db('user_roles').del();
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
            expect(err.status).to.equal(404)
            done();
        });
    });
});
