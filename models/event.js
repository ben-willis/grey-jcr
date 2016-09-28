var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');

/* Event Object*/
var Event = function (data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.time = new Date(data.time);
    this.image = data.image;
}

Event.prototype.update = function(name, description, time, image) {
    data = {
        name: name,
        slug: slug(name),
        description: description,
        time: new Date(time)
    }
    if (image)
        data.image = image;
    return db('events').where({id: this.id}).update(data).then(function() {
        this.name = name;
        this.slug = slug(name);
        this.description = description;
        this.time = new Date(time);
        if (image)
            this.image = image;
        return;
    });
};

Event.prototype.delete = function() {
    return db('events').where({id: this.id}).del();
}

/* Static Event Methods */

Event.create = function(name, description, time, image) {
    return db('events').insert({
        name: name,
        slug: slug(name),
        description: description,
        time: new Date(time),
        image: image
    }).returning("id").then(function(id){
        return new Event({
            id: id[0],
            name: name,
            slug: slug(name),
            description: description,
            time: new Date(time),
            image: image
        });
    })
}

Event.findById = function (id) {
    return db('events')
        .where({'id': id})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Event not found");
            return new Event(data)
        });
}

Event.findBySlugAndDate = function(slug, date) {
    return db('events').first().whereBetween('time', [
        date,
        new Date(date.getTime() + 24*60*60*1000)
    ]).andWhere({slug: slug}).then(function(data) {
        if (!data) throw httpError(404, "Event not found");
        return new Event(data)
    });
}

Event.getByMonth = function(year, month) {
    return db('events').select().whereBetween('time', [
        new Date(year, month-1),
        new Date(year, month)
    ]).then(function(events) {
        if (!events) throw httpError(404, "Event not found");
        return Promise.all(
            events.map(function(event_data){
                return new Event(event_data);
            })
        )
    });
}

Event.getFutureEvents = function() {
    return db('events').select().where('time', '>', new Date()).then(function(events) {
        return Promise.all(
            events.map(function(event_data){
                return new Event(event_data);
            })
        )
    });
}

Event.getPastEvents = function() {
    return db('events').select().where('time', '<', new Date()).then(function(events) {
        return Promise.all(
            events.map(function(event_data){
                return new Event(event_data);
            })
        )
    });
}

module.exports = Event;
