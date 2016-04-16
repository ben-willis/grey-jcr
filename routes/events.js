var express = require('express');
var router = express.Router();
var validator = require('validator');
var treeize   = require('treeize');

/* GET home page. */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT name, timestamp, image, slug FROM events WHERE timestamp>NOW() ORDER BY timestamp ASC')
		.then(function (events) {
			res.render('events/index', {events: events});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET calendar page. */
router.get('/calendar/:year?/:month?', function (req, res, next) {
	var year = (isNaN(req.params.year)) ? (new Date()).getFullYear() : req.params.year;
	var month = (isNaN(req.params.month)) ? (new Date()).getMonth()+1 : req.params.month;
	req.db.manyOrNone("SELECT id, name, timestamp, slug FROM events WHERE EXTRACT(YEAR FROM timestamp)=$1 AND EXTRACT(MONTH FROM timestamp)=$2 ORDER BY timestamp ASC", [year, month])
		.then(function (events) {
			res.render('events/calendar', {events: events, month: month, year: year});
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET the bookings page */
router.get('/:eventid/:ticketid/book', function (req, res, next) {
	req.db.one('SELECT * FROM tickets WHERE id=$1', [req.params.ticketid])
		.then(function (ticket) {
			if (ticket.open_sales > (new Date()) || ticket.close_sales < (new Date())) {
				err = new Error("Booking is not open at this time");
				throw err;
			}
			res.render('events/event_book', {eventid: req.params.eventid, ticket: ticket});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a booking */
router.post('/:eventid/:ticketid/book', function (req, res, next) {
	var bookings = [];
	for (var i = 0; i < req.body.bookings.length; i++) {
		if (req.body.bookings[i] != "") {
			bookings.push(req.body.bookings[i]);
		}
	};

	req.db.tx(function (t) {
		// t = this;
		var ticketname;
		var ticketprice;
		var allow_guests;
		var debtors = [];
		return this.sequence(function (index, data, delay) {
			switch (index) {
				// Check they haven't already booked on
				case 0:
					var query = 'SELECT users.username, users.name, bookings.id, (SELECT SUM(amount) FROM debts WHERE username=users.username) AS debt FROM users LEFT JOIN bookings ON users.username=bookings.username WHERE (bookings.ticketid=$1 OR bookings.ticketid IS NULL) AND (';
					var values = [req.params.ticketid];
					for (i = 0; i<bookings.length; i++) {
						if (i!=0) {
							query += ' OR ';
						}
						query += 'users.username=$'+(i+2);
						values.push(bookings[i]);
					}
					query += ')';
					return this.query(query, values);
				// Check they booked the right number of places
				case 1:
					for (var i = 0; i < data.length; i++) {
						if (data[i].id != null) {
							err = new Error(data[i].name + " is already booked on.")
							throw err;
						}
						if (parseInt(data[i].debt) > 0 ) {
							debtors.push(data[i].name);
						}
					};
					return req.db.one("SELECT name, min_booking, max_booking, open_sales, close_sales, price, guests, block_debtors FROM tickets WHERE id=$1", [req.params.ticketid])
				// Check there are enough places
				case 2:
					if (bookings.length < data.min_booking || bookings.length > data.max_booking) {
						err = new Error("You've either booked to many or too few!");
						throw err;
					}
					if (new Date() < data.open_sales || new Date() > data.close_sales) {
						err = new Error("Booking is not open at this time");
						throw err;
					}
					if (data.block_debtors && debtors.length>0) {
						err = new Error(debtors[0] + " is a debtor and debtors are blocked from booking.");
						throw err;
					}
					ticketname = data.name;
					ticketprice = data.price;
					allow_guests = data.guests;
					return this.query('SELECT stock - (SELECT COUNT(*) FROM bookings WHERE ticketid=$1) AS remaining FROM tickets WHERE id=$1', [req.params.ticketid]);
				// Book them on
				case 3:
					if (data.remaining < bookings.length) {
						err = new Error("No more tickets left");
						throw err;
					}
					var query = 'INSERT INTO bookings (username, booked_by, eventid, ticketid, guest_name) VALUES';
					var values = [req.user.username, req.params.eventid, req.params.ticketid];
					for (i = 0; i<bookings.length; i++) {
						if (i!=0) {
							query += ', ';
						}
						if (validator.matches(bookings[i], /[A-Za-z]{4}[0-9]{2}/i || !allow_guests)) {
							query += '($'+(i+4)+', $1, $2, $3, NULL)';
						} else {
							query += '(NULL, $1, $2, $3, $'+(i+4)+')';
						}
						values.push(bookings[i]);
					}
					query += ' RETURNING id, username';
					return this.query(query, values);
				// Add their debts
				case 4:
					var query = 'INSERT INTO debts (name, message, amount, bookingid, username) VALUES '
					var values = [ticketname, ticketprice];
					for (var i = 0; i < data.length; i++) {
						if (i!=0) {
							query += ', '
						}
						query += '($1, $'+(3*i + 5)+', $2, $'+(3*i + 3)+', $'+(3*i + 4)+')';
						values.push(data[i].id);
						if (validator.matches(bookings[i], /[A-Za-z]{4}[0-9]{2}/i || !allow_guests)) {
							values.push(data[i].username);
						} else {
							values.push(req.user.username);
						}
						values.push('Ticket for '+bookings[i]);
					};
					return this.query(query, values);
			}
		});
	})
	.then(function (data) {
		return req.db.one('SELECT events.timestamp, events.slug FROM events WHERE events.id=$1', [req.params.eventid])
	})
	.then(function (event) {
		res.redirect(303, "/events/"+event.timestamp.getFullYear()+"/"+(event.timestamp.getMonth()+1)+"/"+(event.timestamp.getDate())+"/"+event.slug+"/"+req.params.ticketid+"/booking?success")
	})
	.catch(function (err) {
		return next(err.error);
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
router.get('/:year/:month/:day/:slug/:ticketid/booking', function (req, res, next) {
	var bookings;
	var event;
	req.db.one("SELECT events.id, events.name FROM events WHERE date_part('year', events.timestamp)=$1 AND date_part('month', events.timestamp)=$2 AND date_part('day', events.timestamp)=$3 AND slug=$4",[req.params.year, req.params.month, req.params.day, req.params.slug])
		.then(function (data) {
			event = data;
			return req.db.many('SELECT bookings.id AS "id*", users.name AS user_name, users.username AS username, bookings.notes, bookings.guest_name, tickets.close_sales AS ticket_close, tickets.name AS ticket_name, tickets.price AS ticket_price, tickets.id AS ticket_id, ticket_option_choices.id AS "choices:id", ticket_option_choices.name AS "choices:name" FROM bookings LEFT JOIN tickets ON bookings.ticketid=tickets.id LEFT JOIN booking_choices ON booking_choices.bookingid=bookings.id LEFT JOIN ticket_option_choices ON ticket_option_choices.id=booking_choices.choiceid LEFT JOIN users ON bookings.username=users.username WHERE tickets.id=$1 AND (bookings.username=$2 OR bookings.booked_by=$2)', [req.params.ticketid, req.user.username]);
		})
		.then(function (data) {
			var bookingTree = new treeize();
			bookingTree.grow(data);
			bookings = bookingTree.getData();
			return req.db.manyOrNone('SELECT ticket_options.name, ticket_options.id, ticket_option_choices.id AS "choices:id", ticket_option_choices.name AS "choices:name", ticket_option_choices.price AS "choices:price" FROM ticket_options LEFT JOIN ticket_option_choices ON ticket_option_choices.optionid=ticket_options.id WHERE ticket_options.ticketid=$1', [req.params.ticketid]);
		})
		.then(function (options) {
			var optionsTree = new treeize();
			optionsTree.grow(options);
			options = optionsTree.getData();
			// For each booking
			for (var i = 0; i < bookings.length; i++) {
				// Add the options array
				bookings[i]['options'] = JSON.parse(JSON.stringify(options));
				// For each option
				for (var j = 0; j < bookings[i].options.length; j++) {
					// For each choice
					for (var k = 0; k < bookings[i].options[j].choices.length; k++) {
						bookings[i].options[j].choices[k].selected = false;
						if (bookings[i].choices){
							// For each selected choice
							for (var l = 0; l < bookings[i].choices.length; l++) {
								// If they're the same
								if (bookings[i].choices[l].id == bookings[i].options[j].choices[k].id) {
									bookings[i].options[j].choices[k].selected = true;
								}
							};
						}
					};
				};
			};
			res.render('events/event_booking', {event: event, bookings: bookings, options: options});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a booking update */
router.post('/:bookingid', function (req, res, next) {
	var ticketid;
	req.db.none('DELETE FROM booking_choices WHERE bookingid=$1', [req.params.bookingid])
		.then(function () {
			req.body.choices = req.body.choices.filter(function(choice) {return (choice!='')});
			var query = 'INSERT INTO booking_choices(bookingid, choiceid) VALUES ';
			var values = [req.params.bookingid];
			for (var i = 0; i < req.body.choices.length; i++) {
				if (i!=0) {
					query+=', '
				}
				query+='($1, $'+(i+2)+')'
				values.push(req.body.choices[i]);
			};
			return req.db.none(query, values);
		})
		.then(function (){
			return req.db.one('UPDATE bookings SET notes=$1 WHERE bookings.id=$2 RETURNING ticketid AS id', [req.body.notes, req.params.bookingid]);
		})
		.then(function (ticket){
			ticketid = ticket.id;
			query = 'UPDATE debts SET amount=(SELECT SUM(price) FROM ticket_option_choices WHERE '
			values = [ticket.id, req.params.bookingid];
			for (var i = 0; i < req.body.choices.length; i++) {
				if (i!=0) {
					query+=' OR '
				}
				query += 'id=$'+(i+3);
				values.push(req.body.choices[i]);
			};
			query += ') + (SELECT price FROM tickets WHERE id=$1) WHERE bookingid=$2'
			return req.db.none(query, values);
		})
		.then(function () {
			return req.db.one('SELECT events.timestamp, events.slug FROM bookings LEFT JOIN events ON events.id=bookings.eventid WHERE bookings.id=$1', [req.params.bookingid])
		})
		.then(function(event) {
			res.redirect(303, "/events/"+event.timestamp.getFullYear()+"/"+(event.timestamp.getMonth()+1)+"/"+(event.timestamp.getDate())+"/"+event.slug+"/"+ticketid+"/booking?success")
		})
		.catch(function (err) {
			next(err);
		})
});

/* GET an event */
router.get('/:year/:month/:day/:slug', function (req, res, next) {
	var event;
	req.db.one("SELECT events.id, events.name, slug, events.description, events.timestamp FROM events WHERE date_part('year', events.timestamp)=$1 AND date_part('month', events.timestamp)=$2 AND date_part('day', events.timestamp)=$3 AND slug=$4", [req.params.year, req.params.month, req.params.day,req.params.slug])
		.then(function (data) {
			event = data;
			if (!req.user) return;
			return req.db.manyOrNone('SELECT tickets.id, tickets.name, bookings.id AS "bookings:id", EXTRACT("EPOCH" FROM (tickets.open_sales - NOW())) AS time_to_open, tickets.close_sales FROM (tickets LEFT JOIN events_tickets ON events_tickets.ticketid=tickets.id) LEFT JOIN bookings ON bookings.ticketid=tickets.id WHERE events_tickets.eventid=$1 AND (bookings.booked_by=$2 OR bookings.booked_by IS NULL)', [data.id, req.user.username]);
		})
		.then(function (data) {
			var ticketTree = new treeize();
			ticketTree.grow(data);
			tickets = ticketTree.getData();
			res.render('events/event', {event: event, tickets: tickets});
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
