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

Room.prototype.addBooking = function (name, start_time, duration, notes) {
    return db('room_bookings').insert({
        name: name,
        room_id: this.id,
        notes: notes,
        start_time: start_time,
        duration: duration
    });
}

Room.prototype.getBookingsByDate = function(date) {
    return db('room_bookings').select().whereBetween('start_time', [
        date,
        new Date(date.getTime() + 24*60*60*1000)
    ]).orderBy('start_time', 'asc');
}

Room.prototype.getFutureBookings = function() {
    return db('room_bookings')
        .select()
        .where('start_time', '>', new Date())
        .orderBy('start_time', 'asc');
}

Room.prototype.removeBooking = function (booking_id) {
    return db('room_bookings').del().where({id: booking_id});
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
