const httpError = require('http-errors');

const models = require("../models");

module.exports = {
  queue: [],
  processing: false,
  processQueue: function() {
    this.processing = (this.queue.length !== 0);

    let currentBooking = this.queue.shift();

    this.checkBookingValid(currentBooking).then(function(){
      return Promise.all(currentBooking.users.map((name) => {
        let username = (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) ? name.toLowerCase() : null;
        let guestname = (name.match(/^[A-Za-z]{4}[0-9]{2}$/gi)) ? null : name;
        return models.booking.create({
          ticket_id: currentBooking.ticket_id,
          event_id: currentBooking.event_id,
          booked_by: currentBooking.booker,
          username: username,
          guestname: guestname
        });
      }));
    }).then(function(bookings) {
      currentBooking.promise.resolve(bookings);
    }).catch(function(err) {
      currentBooking.promise.reject(err);
    }).then(function() {
      if (this.queue.length > 0) {
        this.processQueue();
      } else {
        this.processing = false;
      }
    }.bind(this));
  },
  checkBookingValid: function(booking) {
    return models.ticket.findById(booking.ticket_id).then(function(ticket) {
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
                  let username = name.toLowerCase();
                  return Promise.all([
                        models.user.findById(username, {include: [models.debt]}),
                        models.booking.findAll({where: {
                            ticket_id: ticket.id,
                            username: username
                        }})
                    ]).then(function([user, userBookings]) {
                      let totalDebt = user.debts.reduce((a, b) => a.amount + b.amount, 0);
                      if (totalDebt > 0 && !ticket.allow_debtors) {
                            throw httpError(400, user.name+" is a debtor and debtors are blocked");
                        }
                        if (userBookings.length > 0) {
                            throw httpError(user.name+" is already booked on");
                        }
                    });
                } else if (!ticket.allow_guests) {
                        throw httpError(400, "Booking is not open to guests");
                }
            })).then(function() {
                    return models.booking.count({where: {ticket_id: booking.ticket_id}});
            }).then(function(bookings_so_far) {
                if (ticket.stock - bookings_so_far < booking.users.length) {
                    throw httpError(400, "No more spaces");
                }
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
};
