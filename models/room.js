var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');


/* Role Object */
var Room = function (data) {
    this.id = data.id;
    this.name = data.name;
}

/* Static Methods */

Room.create = function (name) {
    return db('rooms').insert({
        name: name
    }).returning("id").then(function(id){
        return new Room({
            id: id[0],
            name: name
        });
    })
}

Room.getAll = function () {
    return db('rooms').select().then(function(rooms) {
        return rooms.map(function(room_data) {
            return new Room(data);
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
