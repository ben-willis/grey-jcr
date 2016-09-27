var Position = require('../../models/position.js');
var db = require('../../helpers/db');

var expect = require("chai").expect;

describe('Static Methods', function() {
    created_position_id = null;
    beforeEach(function(done) {
        db('positions').insert({
            title: "Test Position",
            slug: "test-position",
            description: "test",
            level: 5
        }).returning(["id"]).then(function(id) {
            created_position_id = id[0];
            done();
        })
    });

    afterEach(function(done) {
        db('positions').del().then(function() {
            created_position_id = null;
            done();
        })
    });

    it("should create new positions", function(done){
        Position.create("Test Position 2", 2).then(function(position) {
            expect(position.title).to.equal("Test Position 2");
            expect(position.slug).to.equal("Test-Position-2");
            expect(position.level).to.equal(2);
            done();
        })
    });

    it("should find positions by id", function(done) {
        Position.findById(created_position_id).then(function(position) {
            expect(position.title).to.equal("Test Position");
            expect(position.slug).to.equal("test-position");
            expect(position.description).to.equal("test");
            expect(position.level).to.equal(5);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("should find positions by slug", function(done) {
        Position.findBySlug("test-position").then(function(position) {
            expect(position.title).to.equal("Test Position");
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("should get all positions", function(done) {
        Position.getAll().then(function(positions) {
            expect(positions).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("should get a user by type", function(done) {
        Position.getByType("exec").then(function(positions) {
            expect(positions).to.have.length(1);
            return Position.getByType("welfare");
        }).then(function(positions) {
            expect(positions).to.have.length(0);
            done();
        }).catch(function(err){
            done(err);
        })
    })
})

describe('Position Object', function() {
    var current_position = null;
    var fake_username = null;

    beforeEach(function(done) {
        db('positions')
            .insert({
                title: "Test Position",
                slug: "test-position",
                description: "test",
                level: 5
            }).returning("id")
            .then(function(id) {
                return Position.findById(id[0])
            }).then(function(position) {
                current_position = position;
                return db('users').insert({
                    username: 'abcd12',
                    email: 'fake@fake.com'
                })
            }).then(function() {
                fake_username = 'abcd12';
                done();
            });
    });

    afterEach(function(done) {
        current_position = null;
        fake_username = null;
        db('positions').del().then(function(){
            return db('users').del();
        }).then(function(){
            return db('user_positions').del();
        }).finally(function() {
            done();
        });
    });

    it("should set it's description", function(done) {
        var description = "This is a test!";
        current_position.setDescription(description).then(function() {
            return Position.findById(current_position.id);
        }).then(function(position) {
            expect(position.description).to.equal("This is a test!");
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it("should delete itself", function(done) {
        current_position_id = current_position.id;
        current_position.delete().then(function() {
            return Position.findById(current_position_id);
        }).catch(function(err) {
            expect(err.status).to.equal(404);
        }).finally(function(){
            done();
        });
    });

    it("should assign a user", function(done) {
        current_position.assignUser(fake_username).then(function() {
            return db('user_positions').select({
                username: fake_username,
                position_id: current_position.id
            })
        }).then(function(data){
            expect(data).to.have.length(1);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should delete a user", function(done) {
        db('user_positions').insert({
            username: fake_username,
            position_id: current_position.id
        }).then(function() {
            return current_position.removeUser(fake_username);
        }).then(function(){
            return db('user_positions').select().where({
                username: fake_username,
                position_id: current_position.id
            })
        }).then(function(data){
            expect(data).to.have.length(0);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should find all users in that position", function(done) {
        db('user_positions').insert({
            username: fake_username,
            position_id: current_position.id
        }).then(function(){
            return current_position.getUsers();
        }).then(function(users) {
            expect(users).to.have.length(1);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should find all blog posts from itself", function(done) {
        current_position.getBlogs().then(function(blogs) {
            expect(blogs).to.have.length(0);
            done();
        }).catch(function(err) {
            done(err);
        });
    });
})
