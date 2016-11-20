var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');

/* Role Object */
var Room = function (data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description
}

Room.prototype.update = function (new_name, new_description) {
    return db('rooms').update({
        name: new_name,
        description: new_description
    }).where({id: this.id}).then(function(){
        this.name = new_name;
        this.description = new_description;
        return;
    }.bind(this));
}

Room.prototype.delete = function () {
    return db('rooms').del().where({id: this.id});
}

Room.prototype.addBooking = function (name, start_time, duration, username, status) {
    return db('room_bookings').insert({
        name: name,
        room_id: this.id,
        username: username,
        start_time: start_time,
        duration: duration,
        status: status
    });
}

Room.prototype.getBookings = function(status, date) {
    return db('room_bookings').select().whereBetween('start_time', [
        date,
        new Date(date.getTime() + 24*60*60*1000)
    ]).andWhere({'room_id': this.id, status: status}).orderBy('start_time', 'asc');
}

Room.prototype.getFutureBookings = function(status) {
    return db('room_bookings')
        .select()
        .where('start_time', '>', new Date())
        .andWhere({'room_id': this.id, status: status})
        .orderBy('start_time', 'asc');
}

Room.prototype.getUserBookings = function(username) {
    return db('room_bookings')
        .select()
        .where('start_time', '>', new Date())
        .andWhere({'room_id': this.id, username: username})
        .orderBy('start_time', 'asc');
}

Room.prototype.updateBooking = function(booking_id, status, notes) {
    return db('room_bookings').where({id: booking_id}).update({
        status: status,
        notes: notes
    })
}

Room.prototype.removeBooking = function (booking_id, username) {
    return db('room_bookings').del().where({id: booking_id, username: username});
}

/* Static Methods */

Room.create = function (name, description) {
    return db('rooms').insert({
        name: name,
        description: description
    }).returning("id").then(function(id){
        return new Room({
            id: id[0],
            name: name,
            description: description
        });
    })
}

Room.getAll = function () {
    return db('rooms').select().then(function(rooms) {
        return rooms.map(function(room_data) {
            return new Room(room_data);
        })
    })
}

Room.findById = function (id) {
    return db('rooms')
        .where({'id': id})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Room not found");
            return new Room(data)
        });
}

module.exports = Room;
