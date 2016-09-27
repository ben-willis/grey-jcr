var Event = require('../../models/event');
var db = require('../../helpers/db');
var slug = require('slug');

var chai = require("chai");
var expect = chai.expect;
chai.use(require('chai-datetime'));

describe('Static Event Methods', function() {
    var test_event_id = null;

    beforeEach(function(done) {
        db('events').insert({
            name: "Test Event",
            slug: slug("Test Event"),
            description: "An event for testing",
            time: new Date(2015, 11, 6)
        }).returning('id').then(function(id) {
            test_event_id = id[0];
            done();
        });
    });

    afterEach(function(done) {
        db('events').del().then(function() {
            done();
        });
    })

    it("can find an event by id", function(done) {
        Event.findById(test_event_id).then(function(event) {
            expect(event.name).to.equal("Test Event");
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can find an event by slug and date");

    it("can create a new event", function(done) {
        Event.create("New Event", "description", new Date(), null).then(function(event) {
            expect(event.name).to.equal("New Event");
            return db('events').select().where({id: event.id});
        }).then(function(events){
            expect(events).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get all events in a given month");

    it("can get all future events", function(done) {
        Event.getFutureEvents().then(function(events) {
            expect(events).to.have.length(0);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get all past events", function(done) {
        Event.getPastEvents().then(function(events) {
            expect(events).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    })
});

describe('Event Object', function() {
    var test_event = null;

    beforeEach(function(done) {
        var now = new Date();
        db('events').insert({
            name: "Test Event",
            slug: slug("Test Event"),
            description: "An event for testing",
            time: now
        }).returning('id').then(function(id) {
            test_event = new Event({
                id: id[0],
                name: "Test Event",
                slug: slug("Test Event"),
                description: "An event for testing",
                time: now
            });
            done();
        });
    });

    afterEach(function(done) {
        db('events').del().then(function() {
            test_event = null;
            done();
        });
    })

    it("can update itself", function(done) {
        test_event.update("New Name", "New Description", new Date(2016, 11, 6)).then(function() {
            return db('events').first().where({id: test_event.id});
        }).then(function(event){
            expect(event.name).to.equal("New Name");
            expect(event.description).to.equal("New Description");
            expect(new Date(event.time)).to.equalDate(new Date(2016, 11, 6));
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can delete itself", function(done) {
        test_event.delete().then(function() {
            return db('events').select().where({id: test_event.id});
        }).then(function(events){
            expect(events).to.have.length(0);
            done();
        }).catch(function(err){
            done(err);
        })
    });
});
