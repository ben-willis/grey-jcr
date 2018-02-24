var db = require('../helpers/db');
var httpError = require('http-errors');

/* Booking Object*/
var Booking = function (data) {
    this.id = data.id;
    this.notes = data.notes;
    this.booked_by = data.booked_by;
    this.username = data.username;
    this.guestname = data.guestname;
    this.event_id = data.event_id;
    this.ticket_id = data.ticket_id;
    this.choices = [];

}

Booking.prototype.updateNotes = function(notes) {
    return db('bookings').where({id: this.id}).update({
        notes: notes
    }).then(function(id){
        this.notes = notes;
    });
};

Booking.prototype.getChoices = function() {
    return db('booking_choices').select('choice_id').where({booking_id: this.id}).then(function(choices) {
        this.choices = choices.map(function(choice) { return choice.choice_id });
        return this.choices;
    }.bind(this));
};

Booking.prototype.getChoiceDetailsById = function(choice_id) {
    return db('ticket_option_choices').first().where({id: choice_id});
};

Booking.prototype.setChoices = function(choices) {
    self = this;
    return db('booking_choices').where({booking_id: self.id}).del().then(function() {
        return db('booking_choices').insert(
            choices.map(function(choice) {
                return {
                    booking_id: self.id,
                    choice_id: choice
                }
            })
        );
    }).then(function() {
        this.choices = choices;
        return;
    });
};


/* Static Methods */

Booking.create = function(ticket_id, event_id, booked_by, names) {
    return Promise.all(
        names.map(function(name) {
            username = (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) ? name.toLowerCase() : null;
            guestname = (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) ? null : name;
            return db('bookings').insert({
                ticket_id: ticket_id,
                event_id: event_id,
                booked_by: booked_by,
                username: username,
                guestname: guestname
            }).returning('id').then(function(id){
                return Booking.findById(id[0]);
            });
        })
    );
};

Booking.findById = function(booking_id) {
    var booking = null;
    return db('bookings').first().where({id: booking_id}).then(function(data) {
        booking = new Booking(data);
        return booking.getChoices();
    }).then(function() {
        return booking;
    });
};

Booking.getByTicketIdAndUsername = function(ticket_id, username) {
    return db('bookings').select().where({ticket_id: ticket_id, username: username}).orWhere({ticket_id: ticket_id, booked_by: username}).then(function(data) {
        if (!data) return [];
        return data.map(function(booking_data) {
            return new Booking(booking_data);
        });
    });
};

Booking.getByTicketId = function(ticket_id) {
    return db('bookings').select().where({ticket_id: ticket_id}).then(function(data){
        return Promise.all(
            data.map(function(booking_data) {
                booking = new Booking(booking_data);
                return booking.getChoices().then(function(choices) {
                    booking = new Booking(booking_data);
                    booking.choices = choices;
                    return booking;
                });
            })
        );
    });
};

Booking.countByTicketId = function(ticket_id) {
    return db('bookings').count().where({ticket_id: ticket_id}).first().then(function(data) {
        return parseInt(data.count);
    });
};

module.exports = Booking;
