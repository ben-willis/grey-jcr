var httpError = require('http-errors');

var Event = require('../models/event');
var Ticket = require('../models/ticket');
var Booking = require('../models/booking');
var User = require('../models/user');

bookings_manager = {
	queue: [],
    processing: false,
	processQueue: function() {
        if (this.queue.length == 0) {
            this.processing = false;
            return;
        } else {
            this.processing = true;
        }

		curr_booking = this.queue.shift();

		Ticket.findById(curr_booking.ticket_id)
			.then(function(){
				return this.checkBookingValid(curr_booking)
			}.bind(this))
			.then(function(){
				return Booking.create(curr_booking.ticket_id, curr_booking.event_id, curr_booking.booker, curr_booking.users)
			})
			.then(function(bookings) {
	            curr_booking.promise.resolve(bookings);
                return;
			})
            .catch(function(err) {
	            curr_booking.promise.reject(err);
                return;
			})
            .then(function() {
	            if (this.queue.length > 0) {
                    this.processQueue();
                } else {
                    this.processing = false;
                }
                return;
			}.bind(this));
	},
    checkBookingValid: function(booking) {
		var ticket = null;
		var user = null;
		return Ticket.findById(booking.ticket_id)
			.then(function(data) {
				ticket = data;
				if (ticket.open_booking > (new Date()) || ticket.close_booking < (new Date())) {
					throw httpError(400, "Booking is closed");
				}
				if (booking.users.length < ticket.min_booking) {
					throw httpError(400, "You must book on at least "+ticket.min_booking+" people")
				}
				if (booking.users.length < ticket.min_booking) {
					throw httpError(400, "You can only book on up to "+ticket.max_booking+" people")
				}
				return;
			})
			.then(function(){
				return Promise.all(
					booking.users.map(function(name) {
						if (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) {
							var username = name.toLowerCase();
							var user = null;
							return User.findByUsername(username).then(function(data) {
								user = data;
								return user.getDebt();
							}).then(function(debt){
								if (debt > 0 && !ticket.allow_debtors) {
									throw httpError(400, user.name+" is a debtor and debtors are blocked")
								}
								return Booking.getByTicketIdAndUsername(ticket.id, user.username);
							}).then(function(bookings) {
								if (!bookings) return;
								for (var i = 0; i < bookings.length; i++) {
									if (bookings[i].username == user.username) throw httpError(user.name+" is already booked on")
								}
							});
						} else if (!ticket.allow_guests) {
								throw httpError(400, "Booking is not open to guests");
						} else {
							return;
						}
					})
				)
			})
			.then(function() {
				return Booking.countByTicketId(ticket.id);
			})
			.then(function(bookings_so_far) {
				if (ticket.stock - bookings_so_far < booking.users.length) {
					throw httpError(400, "No more spaces")
				}
				return;
			})
    },
    createBooking: function(ticket_id, event_id, username, users) {
    	return new Promise(function(resolve, reject) {
    		this.queue.push({
    			ticket_id: ticket_id,
    			event_id: event_id,
    			booker: username,
    			users: users,
    			promise: {
    				resolve: resolve,
    				reject: reject
    			}
    		});
    		if (!this.processing) {
    			this.processQueue();
    		}
        }.bind(this))
    }
}

module.exports = bookings_manager;
