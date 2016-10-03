var db = require('../helpers/db');
var httpError = require('http-errors');

/* Booking Object*/
var Election = function (data) {
    this.id = data.id;
}

/* Election Structure

Election
 |_ id (int)
 |_ name (string)
 |_ positions (array)
 |   |_ id (int)
 |   |_ election_id (int)
 |   |_ name (string)
 |   |_ nominees (array)
 |       |_ id (int)
 |       |_ position_id (int)
 |       |_ name (string)
 |_ votes
     |_


*/
