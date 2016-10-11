var Room = require('../../models/room');
var db = require('../../helpers/db');
var slug = require('slug');

var chai = require("chai");
var expect = chai.expect;

describe('Static Event Methods', function() {
    var test_room_id = null;

    beforeEach(function(done) {
        db('rooms').insert({
            name: "Test Room"
        }).returning('id').then(function(id) {
            test_room_id = id[0];
            done();
        });
    });

    afterEach(function(done) {
        db('rooms').del().then(function() {
            test_room_id = null;
            done();
        });
    })

    it("should find a room by id", function(done) {
        Room.findById(test_room_id).then(function(room) {
            expect(room.name).to.equal("Test Room");
            done();
        }).catch(done);
    });

    it("should create a new room", function(done) {
        Room.create("New Room").then(function(){
            return db('rooms').select();
        }).then(function(rooms) {
            expect(rooms).to.have.length(2);
            done();
        }).catch(done);
    });

    it("should get all rooms", function (done) {
        Room.getAll().then(function(rooms) {
            expect(rooms).to.have.length(1);
            done();
        }).catch(done);
    })
});

describe('Room Methods', function() {
    it("should get all bookings for a date of each type");
    it("should get all future bookings of each type");
    it("should add a booking");
    it("should change the status of a booking");
    it("should delete a booking");
    it("should get all bookings for a user of each type")
})
