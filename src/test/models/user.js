var User = require('../../models/user.js');
var db = require('../../helpers/db');

var chai = require("chai")
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
chai.use(chaiAsPromised);

describe.skip("User model", function() {

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
    });

    it("should get all debtors")

    var current_user = null;
    var fake_debt_id = null;
    var fake_role_id = null;

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

    it("should get its total debt and all debts", function(done) {
        current_user.getDebt().then(function(amount) {
            expect(amount).to.equal(10)
            return current_user.getDebts();
        }).then(function(debts) {
            expect(debts).to.have.length(1)
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("should pay its debt", function(done) {
        current_user.payDebt("Test Payment", "message", 10)
            .then(function() {
                return current_user.getDebt();
            }).then(function(amount) {
                expect(amount).to.equal(0);
                done();
            }).catch(function(err){
                done(err);
            })
    });

    it("should add to its debt", function(done) {
        current_user.addDebt("Test Debt 2", "Message", 10)
            .then(function() {
                return current_user.getDebt();
            }).then(function(amount) {
                expect(amount).to.equal(20);
                done();
            }).catch(function(err){
                done(err);
            })
    });

    it("should assign itself to a role", function(done) {
        current_user.assignRole(fake_role_id).then(function() {
            return db('user_roles').select().where({
                username: current_user.username,
                role_id: fake_role_id
            })
        }).then(function(data){
            expect(data).to.have.length(1);
            done();
        }).catch(done);
    });

    it("should get all its roles", function(done) {
        db('user_roles').insert({
            username: current_user.username,
            role_id: fake_role_id
        }).then(function(){
            return current_user.getRoles();
        }).then(function(roles) {
            expect(roles).to.have.length(1);
            done();
        })
    });

    it("should remove itself from a role", function(done) {
        db('user_roles').insert({
            username: current_user.username,
            role_id: fake_role_id
        }).then(function(){
            return current_user.removeRole(fake_role_id)
        }).then(function() {
            return db('user_roles').select().where({
                username: current_user.username,
                role_id: fake_role_id
            })
        }).then(function(data){
            expect(data).to.have.length(0);
            done();
        })
    });

    it("should get its vote in an election");
})
