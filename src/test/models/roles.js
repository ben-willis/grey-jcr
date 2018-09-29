var models = require('../../models');

var expect = require("chai").expect;

describe.skip('Role model', function() {
    created_role_id = null;

    it("should create new roles", function(done){
        Role.create("Test Role 2", 2).then(function(role) {
            expect(role.title).to.equal("Test Role 2");
            expect(role.slug).to.equal("Test-Role-2");
            expect(role.level).to.equal(2);
            done();
        }).catch(done);
    });

    it("should find roles by id", function(done) {
        Role.findById(created_role_id).then(function(role) {
            expect(role.title).to.equal("Test Role");
            expect(role.slug).to.equal("test-role");
            expect(role.description).to.equal("test");
            expect(role.level).to.equal(5);
            done();
        }).catch(function(err){
            done(err);
        }).catch(done);
    });

    it("should find roles by slug", function(done) {
        Role.findBySlug("test-role").then(function(role) {
            expect(role.title).to.equal("Test Role");
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("should get all roles", function(done) {
        Role.getAll().then(function(roles) {
            expect(roles).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("should set it's description", function(done) {
        var description = "This is a test!";
        current_role.setDescription(description).then(function() {
            return Role.findById(current_role.id);
        }).then(function(role) {
            expect(role.description).to.equal("This is a test!");
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it("should assign a user", function(done) {
        current_role.assignUser(fake_username).then(function() {
            return db('user_roles').select().where({
                username: fake_username,
                role_id: current_role.id
            });
        }).then(function(data){
            expect(data).to.have.length(1);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should delete a user", function(done) {
        db('user_roles').insert({
            username: fake_username,
            role_id: current_role.id
        }).then(function() {
            return current_role.removeUser(fake_username);
        }).then(function(){
            return db('user_roles').select().where({
                username: fake_username,
                role_id: current_role.id
            })
        }).then(function(data){
            expect(data).to.have.length(0);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it("should find all users in that role", function(done) {
        db('user_roles').insert({
            username: fake_username,
            role_id: current_role.id
        }).then(function(){
            return current_role.getUsers();
        }).then(function(users) {
            expect(users).to.have.length(1);
            done();
        }).catch(function(err) {
            done(err);
        });
    });


    it("should delete itself", function(done) {
        current_role_id = current_role.id;
        current_role.delete().then(function() {
            return Role.findById(current_role_id);
        }).catch(function(err) {
            expect(err.status).to.equal(404);
        }).finally(function(){
            done();
        });
    });
})
