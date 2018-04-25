var httpError = require('http-errors');

var models = require("../models");

var bookings_manager = {
  queue: [],
  processing: false,
  processQueue: function() {
    this.processing = (this.queue.length !== 0);

		var currentBooking = this.queue.shift();

		this.checkBookingValid(currentBooking).then(function(){
			return models.booking.create(currentBooking.users.map((name) => {
				var username = (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) ? name.toLowerCase() : null;
        var guestname = (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) ? null : name;
				return {
					ticket_id: currentBooking.ticket_id,
					event_id: currentBooking.event_id,
					booked_by: currentBooking.booker,
					username: username,
					guestname: guestname
				};
			}));
		}).then(function(bookings) {
      currentBooking.promise.resolve(bookings);
      return;
		}).catch(function(err) {
      currentBooking.promise.reject(err);
      return;
		}).then(function() {
      if (this.queue.length > 0) {
        this.processQueue();
      } else {
        this.processing = false;
      }
      return;
		}.bind(this));
	},
  checkBookingValid: function(booking) {
  	models.ticket.findById(booking.ticket_id).then(function(ticket) {
  		if (ticket.open_booking > (new Date()) || ticket.close_booking < (new Date())) {
				throw httpError(400, "Booking is closed");
			}
			if (booking.users.length < ticket.min_booking) {
				throw httpError(400, "You must book on at least "+ticket.min_booking+" people");
			}
			if (booking.users.length < ticket.min_booking) {
				throw httpError(400, "You can only book on up to "+ticket.max_booking+" people");
			}

			return Promise.all(booking.users.map(function(name) {
				if (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) {
					var username = name.toLowerCase();
					return models.user.findById(username, {
						include: [
							models.debt,
							{model: models.booking, where: {ticket_id: ticket.id}}
						]
					}).then(function(user) {
						var totalDebt = user.debts.reduce((a, b) => a.amount + b.amount, 0);
						if (totalDebt > 0 && !ticket.allow_debtors) {
							throw httpError(400, user.name+" is a debtor and debtors are blocked");
						}
						if (!user.bookings) return;
						for (var i = 0; i < user.bookings.length; i++) {
							if (user.bookings[i].username == user.username) throw httpError(user.name+" is already booked on");
						}
					});
				} else if (!ticket.allow_guests) {
						throw httpError(400, "Booking is not open to guests");
				} else return;
			})).then(function() {
					return models.booking.count({where: {ticket_id: booking.ticket_id}});
			}).then(function(bookings_so_far) {
				if (ticket.stock - bookings_so_far < booking.users.length) {
					throw httpError(400, "No more spaces");
				} else return;
			});
		});
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
  		if (!this.processing) this.processQueue();
    }.bind(this));
  }
}

module.exports = bookings_manager;