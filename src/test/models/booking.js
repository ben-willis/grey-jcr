var models = require('../../models');

var expect = require("chai").expect;

describe('Booking model', function() {
		var testBookingId = null;

    it("can create a new booking", function(done) {
    	models.booking.create({
    		username: "wxyz89",
    		event_id: 1,
    		ticket_id: 1,
    		booked_by: "abcd12"
    	}).then(function(booking) {
    		testBookingId = booking.id;
    		expect(booking.guestname).to.be.null;
    		done();
    	}).catch(done);
    });

    it("can find a booking by id", function(done) {
    	models.booking.findById(testBookingId).then(function(booking) {
    		expect(booking.username).to.equal("wxyz89");
    		done();
    	}).catch(done);
    });

    it("can find one booked for user and ticket id", function(done) {
    	models.booking.findOne({
    		where: {
    			username: "wxyz89",
    			ticket_id: 1
    		}
    	}).then(function(booking) {
    		expect(booking.booked_by).to.equal("abcd12");
    		done();
    	}).catch(done);
    });

    it("can find all bookings by a user", function(done) {
    	models.booking.findAll({where: {booked_by: "abcd12"}}).then(function(bookings) {
    		expect(bookings).to.not.have.length(0);
    		done();
    	}).catch(done);
    });

    it("should set notes for booking");

    it("should get choices for a booking");

    it("should set choices for a booking");
});