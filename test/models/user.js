var User = require('../../models/user.js');
var db = require('../../helpers/db');

var chai = require("chai")
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
chai.use(chaiAsPromised);

describe("user model", function() {
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

    it("should create new users", function(){
        expect(User.create("fake12")).to.be.rejected;
    });

    it("should find users by username", function(done) {
        User.findByUsername('abcd12').then(function(user) {
            expect(user.username).to.equal("abcd12");
            expect(user.email).to.equal("abcd@efg.com");
            expect(user.name).to.equal("Abc Def");
            done();
        })
    });

    it("should change users names", function(done) {
        var current_user = null;
        User.findByUsername('abcd12').then(function(user) {
            current_user = user;
            return current_user.changeName('Ghi Jkl')
        }).then(function() {
            expect(current_user.name).to.equal('Ghi Jkl');
            done();
        });
    });

    it("should delete users", function(done) {
        User.findByUsername('abcd12').then(function(user) {
            current_user = user;
            return current_user.delete();
        }).then(function() {
            expect(User.findByUsername('abcd12')).to.be.rejected;
            done();
        })
    })

    it("should authorize users", function() {
        expect(User.authorize("fake", "fake")).to.be.rejected;
    })
})
