var Ticket = require('../../models/ticket');
var db = require('../../helpers/db');

var expect = require("chai").expect;

describe('Static Ticket Methods', function() {
    var test_ticket_id = null;

    beforeEach(function(done) {
        db('tickets').insert({
            name: "Test Ticket",
            max_booking: 4,
            min_booking: 1,
            allow_debtors: true,
            allow_guests: true,
            open_booking: new Date(2016, 7, 1),
            close_booking: new Date(2016, 8, 1),
            price: 500,
            guest_surcharge: 100,
            stock: 10
        }).returning('id').then(function(id) {
            test_ticket_id = id[0];
            done();
        });
    });

    afterEach(function(done) {
        db('tickets').del().then(function() {
            test_ticket_id = null;
            done();
        });
    })

    it("can find ticket by id", function(done) {
        Ticket.findById(test_ticket_id).then(function(ticket){
            expect(ticket.name).to.equal("Test Ticket");
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get all tickets", function(done) {
        Ticket.getAll().then(function(tickets) {
            expect(tickets).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can create new ticket", function(done) {
        Ticket.create("Fake Ticket").then(function(ticket) {
            expect(ticket.name).to.equal("Fake Ticket");
            done();
        }).catch(function(err){
            done(err);
        })
    })
});

describe('Ticket Object', function() {
    var test_ticket = null;

    beforeEach(function(done) {
        var now = new Date();
        db('tickets').insert({
            name: "Test Ticket",
            max_booking: 4,
            min_booking: 1,
            allow_debtors: true,
            allow_guests: true,
            open_booking: new Date(2016, 7, 1),
            close_booking: new Date(2016, 8, 1),
            price: 500,
            guest_surcharge: 100,
            stock: 10
        }).returning('id').then(function(id) {
            test_ticket = new Ticket({
                id: id[0],
                name: "Test Ticket",
                max_booking: 4,
                min_booking: 1,
                allow_debtors: true,
                allow_guests: true,
                open_booking: new Date(2016, 7, 1),
                close_booking: new Date(2016, 8, 1),
                price: 500,
                guest_surcharge: 100,
                stock: 10
            });
            done();
        });
    });

    afterEach(function(done) {
        Promise.all([
            db('tickets').del(),
            db('ticket_options').del(),
            db('ticket_option_choices').del()
        ]).then(function() {
            test_ticket = null;
            done();
        });
    })

    it('can update itself', function(done){
        test_ticket.update("Updated Test Ticket", {
            max_booking: 8,
            min_booking: 1,
            allow_debtors: true,
            allow_guests: true,
            open_booking: new Date(2016, 7, 1),
            close_booking: new Date(2016, 8, 1),
            price: 500,
            guest_surcharge: 100,
            stock: 20
        }).then(function() {
            expect(this.name).to.equal("Updated Test Ticket");
            expect(this.max_booking).to.equal(8);
            expect(this.stock).to.equal(20);
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it('can get options and choices', function (done) {
        db('ticket_options').insert({
            ticket_id: test_ticket.id,
            name: "Test Option"
        }).returning('id').then(function(id){
            return db('ticket_option_choices').insert([{
                option_id: id[0],
                name: "Test Option 1",
                price: 1
            }, {
                option_id: id[0],
                name: "Test Option 2",
                price: 2
            }]);
        }).then(function() {
            return test_ticket.getOptionsAndChoices();
        }).then(function(options) {
            expect(options).to.have.length(1);
            expect(options[0].name).to.equal("Test Option");
            expect(options[0].choices).to.have.length(2);
            expect(options[0].choices[0].name).to.equal("Test Option 1");
            done();
        }).catch(function(err){
            done(err);
        })
    })

    it('can add, rename and delete options' ,function(done) {
        expect(test_ticket.options).to.have.length(0);
        test_ticket.addOption("New Option").then(function() {
            expect(test_ticket.options).to.have.length(1);
            return test_ticket.renameOption(test_ticket.options[0].id, "Renamed!");
        }).then(function() {
            expect(test_ticket.options[0].name).to.equal("Renamed!");
            return test_ticket.removeOption(test_ticket.options[0].id)
        }).then(function() {
            expect(test_ticket.options).to.have.length(0);
            done();
        }).catch(done);
    });

    it('can add, edit and delete choices', function(done) {
        test_ticket.addOption("New Option").then(function() {
            expect(test_ticket.options[0].choices).to.have.length(0);
            return test_ticket.addChoice(test_ticket.options[0].id, "New Option", 500);
        }).then(function(){
            expect(test_ticket.options[0].choices).to.have.length(1);
            return test_ticket.updateChoice(test_ticket.options[0].choices[0].id, "Renamed!", 1000);
        }).then(function() {
            expect(test_ticket.options[0].choices[0].name).to.equal("Renamed!");
            return test_ticket.removeChoice(test_ticket.options[0].choices[0].id)
        }).then(function() {
            expect(test_ticket.options[0].choices).to.have.length(0);
            done();
        }).catch(done);
    });

    it('can delete itself', function(done){
        test_ticket.delete().then(function() {
            return db('tickets').select();
        }).then(function(tickets){
            expect(tickets).to.have.length(0);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get associated events", function(done) {
        db('event_tickets').insert({
            event_id: null,
            ticket_id: test_ticket.id
        }).then(function(){
            return test_ticket.getEvents();
        }).then(function(tickets) {
            expect(tickets).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        });
    })
});
