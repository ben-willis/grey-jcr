var express = require('express');
var router = express.Router();
var validator = require('validator');
var treeize   = require('treeize');
var httpError = require('http-errors');

var Event = require('../models/event');
var Ticket = require('../models/ticket');
var Booking = require('../models/booking');
var User = require('../models/user');

/* GET home page. */
router.get('/', function (req, res, next) {
	Event.getFutureEvents().then(function (events) {
		res.render('events/index', {events: events.splice(0,4)});
	}).catch(function (err) {
		next(err);
	});
});

/* GET calendar page. */
router.get('/calendar/:year?/:month?', function (req, res, next) {
	var year = (isNaN(req.params.year)) ? (new Date()).getFullYear() : req.params.year;
	var month = (isNaN(req.params.month)) ? (new Date()).getMonth()+1 : req.params.month;
	res.render('events/calendar', {month: month, year: year});
});

/* GET the bookings page */
router.get('/:event_id/:ticket_id/book', function (req, res, next) {
	Ticket.findById(parseInt(req.params.ticket_id)).then(function (ticket) {
			if (ticket.open_booking > (new Date()) || ticket.close_booking < (new Date())) {
				throw httpError(400, "Booking is not open at this time");
			}
			res.render('events/event_book', {event_id: req.params.event_id, ticket: ticket});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a booking */
router.post('/:event_id/:ticket_id/book', function (req, res, next) {
	var bookings = req.body.bookings.filter(function(booking) {
		return (booking != "");
	});

	bookings_manager.createBooking(parseInt(req.params.ticket_id), parseInt(req.params.event_id), req.user.username, bookings)
		.then(function(booking_ids) {
			return Ticket.findById(parseInt(req.params.ticket_id));
		})
		.then(function(ticket) {
			return Promise.all(
				bookings.map(function(name) {
					username = (name.match(/[A-Za-z]{4}[0-9]{2}/gi)) ? name : req.user.username;
					amount = (name.match(/[A-Za-z]{4}[0-9]{2}/gi)) ? ticket.price : ticket.price + ticket.guest_surcharge;
					return User.findByUsername(username).then(function(user){
						return user.addDebt(ticket.name, "Ticket for "+name, amount);
					});
				})
			)
		})
		.then(function(){
			return Event.findById(parseInt(req.params.event_id))
		})
		.then(function(event) {
			res.redirect(303, "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+req.params.ticket_id+"/booking?success")
		})
		.catch(function(err) {
			next(err);
		});
});

router.get('/:eventid/:ticketid/book/result', function (req, res, next) {
	if (req.query.success != undefined) {
		req.db.many('SELECT username FROM bookings WHERE ticketid=$1 AND booked_by=$2',[req.params.ticketid, req.user.username])
			.then(function (bookings){
				res.render('events/event_book_result', {bookings:bookings});
			})
			.catch(function (err) {
				next(err);
			});
	} else {
		res.render('events/event_book_result');
	}
});


/* GET your booking */
router.get('/:year/:month/:day/:slug/:ticket_id/booking', function (req, res, next) {
	var ticket;
	var event;
	Event.findBySlugAndDate(req.params.slug, new Date(req.params.year, parseInt(req.params.month)-1, req.params.day))
		.then(function(data) {
			event = data;
			return Ticket.findById(parseInt(req.params.ticket_id))
		})
		.then(function(data) {
			ticket = data;
			return Booking.getByTicketIdAndUsername(parseInt(req.params.ticket_id), req.user.username);
		})
		.then(function(bookings){
			return Promise.all(
				bookings.map(function(booking) {
					return booking.getChoices().then(function(choices) {
						console.log(choices);
						return booking;
					})
				})
			)
		})
		.then(function(bookings) {
			res.render('events/event_booking', {event: event, ticket: ticket, bookings: bookings});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a booking update */
router.post('/:booking_id', function (req, res, next) {
	var booking = null;
	Booking.findById(parseInt(req.params.booking_id)).then(function(data) {
		booking = data;
		return Promise.all([
			booking.setChoices(req.body.choices),
			booking.updateNotes(req.body.notes)
		])
	}).then(function(){
		if (booking.username) {
			return User.findByUsername(booking.username);
		} else {
			return User.findByUsername(booking.booked_by);
		}
	}).then(function(user){
		// Here we shall set debt
		return;
	}).then(function() {
		return Event.findById(parseInt(req.body.event_id));
	}).then(function(event){
		res.redirect(303, "/events/"+event.time.getFullYear()+"/"+(event.time.getMonth()+1)+"/"+(event.time.getDate())+"/"+event.slug+"/"+booking.ticket_id+"/booking?success");
	});
});

/* GET an event */
router.get('/:year/:month/:day/:slug', function (req, res, next) {
	var event = null;
	var tickets = [];
	Event.findBySlugAndDate(req.params.slug, new Date(req.params.year, req.params.month-1, req.params.day)).then(function (data) {
			event = data;
			if (!req.user) return;
			return event.getTickets();
		})
		.then(function(ticket_ids) {
			return Promise.all(
				ticket_ids.map(function(ticket_id) {
					var ticket = null;
					return Ticket.findById(ticket_id)
						.then(function(data) {
							ticket = data;
							return Booking.getByTicketIdAndUsername(data.id, req.user.username);
						})
						.then(function(bookings) {
							ticket.bookings = bookings;
							return ticket
						});
				})
			)
		})
		.then(function(tickets) {
			res.render('events/event', {event: event, tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;

/* BOOKING MANAGER */

bookings_manager = {
	queue: [],
    processing: false,
	processQueue() {
        self = this;
        self.processing = !(self.queue.length == 0);
        if (!self.processing) return;

		booking = self.queue.shift();

		Ticket.findById(booking.ticket_id)
			.then(self.checkBookingValid(booking))
			.then(Booking.create(booking.ticket_id, booking.event_id, booking.booker, booking.users))
			.then(function(booking_id) {
	            booking.promise.resolve(booking_id);
			}).catch(function(err) {
	            booking.promise.reject(err);
			}).finally(function() {
	            self.processQueue();
			});
	},
    checkBookingValid(booking) {
        return new Promise(function(resolve, reject) {
			// Check Bookings is open
			// Check they've booked on the right number
			// Check for debtors/guests
			// Check no ones already booked on
			// Check there are enough spaces
            setTimeout(function() {
                if(Math.random() < 0.5) {
                    reject("Not Valid");
                } else {
                    resolve();
                }
            }, Math.random() * 1000)
        })
    }
}

bookings_manager.createBooking = function(ticket_id, event_id, username, users) {
	self = this;
	return new Promise(function(resolve, reject) {
		self.queue.push({
			ticket_id: ticket_id,
			event_id: event_id,
			booker: username,
			users: users,
			promise: {
				resolve: resolve,
				reject: reject
			}
		});
		if (!self.processing) {
			self.processQueue();
		}
	});
}

// req.db.tx(function (t) {
// 	// t = this;
// 	var ticketname;
// 	var ticketprice;
// 	var guest_surcharge;
// 	var allow_guests;
// 	var debtors = [];
// 	return this.sequence(function (index, data, delay) {
// 		switch (index) {
// 			case 0:
// 				// Find all the usernames that are being booked on
// 				var query = 'SELECT users.username, users.name, bookings.id, (SELECT SUM(amount) FROM debts WHERE username=users.username) AS debt FROM users LEFT JOIN bookings ON users.username=bookings.username WHERE (bookings.ticketid=$1 OR bookings.ticketid IS NULL) AND (';
// 				var values = [req.params.ticketid];
// 				for (i = 0; i<bookings.length; i++) {
// 					if (i!=0) {
// 						query += ' OR ';
// 					}
// 					query += 'users.username=$'+(i+2);
// 					values.push(bookings[i]);
// 				}
// 				query += ')';
// 				return this.query(query, values);
// 			case 1:
// 				// For each user they're trying to book on
// 				for (var i = 0; i < data.length; i++) {
// 					// Check that they don't already have a ticket
// 					if (data[i].id != null) {
// 						err = new Error(data[i].name + " is already booked on.")
// 						throw err;
// 					}
// 					// Remember whether they're a debtor
// 					if (parseInt(data[i].debt) > 0 ) {
// 						debtors.push(data[i].name);
// 					}
// 				};
// 				return req.db.one("SELECT name, min_booking, max_booking, open_sales, close_sales, price, guests, guest_surcharge, block_debtors FROM tickets WHERE id=$1", [req.params.ticketid])
// 			// Check there are enough places
// 			case 2:
// 				if (bookings.length < data.min_booking || bookings.length > data.max_booking) {
// 					err = new Error("You need to book on at least "+data.min_booking+" and at most "+data.max_booking+" people.");
// 					throw err;
// 				}
// 				if (new Date() < data.open_sales || new Date() > data.close_sales) {
// 					err = new Error("Booking is not open at this time.");
// 					throw err;
// 				}
// 				if (data.block_debtors && debtors.length>0) {
// 					err = new Error(debtors[0] + " is a debtor and debtors are blocked from booking.");
// 					throw err;
// 				}
// 				ticketname = data.name;
// 				ticketprice = data.price;
// 				allow_guests = data.guests;
// 				guest_surcharge = data.guest_surcharge;
// 				return this.one('SELECT stock - (SELECT COUNT(*) FROM bookings WHERE ticketid=$1) AS remaining FROM tickets WHERE id=$1', [req.params.ticketid]);
// 			// Book them on
// 			case 3:
// 				if (data.remaining < bookings.length) {
// 					err = new Error("No more tickets left");
// 					throw err;
// 				}
// 				var query = 'INSERT INTO bookings (username, booked_by, eventid, ticketid, guest_name) VALUES';
// 				var values = [req.user.username, req.params.eventid, req.params.ticketid];
// 				for (i = 0; i<bookings.length; i++) {
// 					if (i!=0) {
// 						query += ', ';
// 					}
// 					if (validator.matches(bookings[i], /[A-Za-z]{4}[0-9]{2}/i) || !allow_guests) {
// 						query += '($'+(i+4)+', $1, $2, $3, NULL)';
// 					} else {
// 						query += '(NULL, $1, $2, $3, $'+(i+4)+')';
// 					}
// 					values.push(bookings[i]);
// 				}
// 				query += ' RETURNING id, username';
// 				return this.query(query, values);
// 			// Add their debts
// 			case 4:
// 				var query = 'INSERT INTO debts (name, message, amount, bookingid, username) VALUES '
// 				var values = [ticketname];
// 				for (var i = 0; i < data.length; i++) {
// 					if (i!=0) {
// 						query += ', '
// 					}
// 					query += '($1, $'+(4*i + 5)+', $'+(4*i + 4)+', $'+(4*i + 2)+', $'+(4*i + 3)+')';
// 					values.push(data[i].id);
// 					if (validator.matches(bookings[i], /[A-Za-z]{4}[0-9]{2}/i) || !allow_guests) {
// 						values.push(data[i].username);
// 						values.push(ticketprice);
// 					} else {
// 						values.push(req.user.username);
// 						values.push(ticketprice + guest_surcharge);
// 					}
// 					values.push('Ticket for '+bookings[i]);
// 				};
// 				return this.query(query, values);
// 		}
// 	});
// })
