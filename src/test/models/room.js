var Room = require('../../models/room');
var db = require('../../helpers/db');
var slug = require('slug');

var chai = require("chai");
var expect = chai.expect;

describe.skip('Room model', function() {
    var test_room_id = null;


    it("should find a room by id", function(done) {
        Room.findById(test_room_id).then(function(room) {
            expect(room.name).to.equal("Test Room");
            done();
        }).catch(done);
    });

    it("should create a new room", function(done) {
        Room.create("New Room", "New Room Description").then(function(){
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

    it("should get all bookings for a date of each type");
    it("should get all future bookings");
    it("should add a booking");
    it("should delete a booking");
    it("should edit a room");
    it("should delete a room");
})
