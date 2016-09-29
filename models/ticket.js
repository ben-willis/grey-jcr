var db = require('../helpers/db');
var httpError = require('http-errors');

/* Folder Object*/
var Ticket = function (data) {
    this.id = data.id;
    this.name = data.name;
    this.max_booking = data.max_booking;
    this.min_booking = data.min_booking;
    this.allow_debtors = data.allow_debtors;
    this.allow_guests = data.allow_guests;
    this.open_booking = data.open_booking;
    this.close_booking = data.close_booking;
    this.price = data.price;
    this.guest_surcharge = data.guest_surcharge;
    this.stock = data.stock;
    this.options = [];
}

Ticket.prototype.update = function(name, options) {
    return db('tickets').where({id: this.id}).update({
        name: name,
        max_booking: options.max_booking,
        min_booking: options.min_booking,
        allow_debtors: options.allow_debtors,
        allow_guests: options.allow_guests,
        open_booking: options.open_booking,
        close_booking: options.close_booking,
        price: options.price,
        guest_surcharge: options.guest_surcharge,
        stock: options.stock
    }).then(function(id){
        this.name = name;
        this.max_booking = options.max_booking;
        this.min_booking = options.min_booking;
        this.allow_debtors = options.allow_debtors;
        this.allow_guests = options.allow_guests;
        this.open_booking = options.open_booking;
        this.close_booking = options.close_booking;
        this.price = options.price;
        this.guest_surcharge = options.guest_surcharge;
        this.stock = options.stock;
    })
}

Ticket.prototype.delete = function() {
    return db('tickets').where({id: this.id}).del();
}

Ticket.prototype.getEvents = function() {
    return db('event_tickets').select('event_id').where({ticket_id: this.id}).then(function(data) {
        return data.map(function(data) {
            return data.event_id
        });
    });
}

Ticket.prototype.getOptionsAndChoices = function() {
    return db('ticket_options').select().where({ticket_id: this.id}).then(function(options) {
        return Promise.all(
            options.map(function(option) {
                return db('ticket_option_choices').select().where({option_id: option.id}).then(function(choices) {
                    option.choices = choices;
                    return option;
                })
            })
        )
    })
}

Ticket.prototype.setOptionsAndChoices = function(options) {
    // Delete all previous options and choices
    return Promise.all(
        this.options.map(function(ticket_option) {
            return Promise.all([
                db('ticket_option_choices').where({option_id: ticket_option.id}).del().then(function() {
                    return db('ticket_options').where({id: ticket_option.id}).del();
                })
            ])
        })
    ).then(function(){
        this_ticket_id = this.id;
        // Create the new options and choices
        return Promise.all(
            options.map(function(option) {
                option.id = null;
                return db('ticket_options').insert({
                    name: option.name,
                    ticket_id: this_ticket_id
                }).returning('id').then(function(ids){
                    option.id = ids[0]
                    return Promise.all(
                        option.choices.map(function(choice) {
                            choice.id = null;
                            return db('ticket_option_choices').insert({
                                option_id: option.id,
                                name: choice.name,
                                price: choice.price
                            }).returning('id').then(function(ids) {
                                choice.id = ids[0];
                                return choice;
                            })
                        })
                    ).then(function(choices) {
                        option.choices = choices;
                        return option;
                    })

                })
            })
        )
    }.bind(this)).then(function (data) {
        this.options = data;
        return;
    }.bind(this))
}

/* Static Methods */

Ticket.create = function(name) {
    return db('tickets').insert({name: name}).returning('id').then(function(id){
        return Ticket.findById(id[0]);
    })
}

Ticket.findById = function(ticket_id) {
    var ticket = null;
    return db('tickets').first().where({id: ticket_id}).then(function(ticket_data) {
        ticket = new Ticket(ticket_data);
        return ticket.getOptionsAndChoices();
    }).then(function(ticket_options) {
        ticket.options = ticket_options;
        return ticket;
    })
}

Ticket.getAll = function() {
    return db('tickets').select().then(function(tickets) {
        return Promise.all(
            tickets.map(function(ticket_data) {
                ticket = new Ticket(ticket_data);
                return ticket.getOptionsAndChoices().then(function(ticket_options) {
                    ticket.options = ticket_options;
                    return ticket;
                })
            })
        )
    })
}

module.exports = Ticket;
