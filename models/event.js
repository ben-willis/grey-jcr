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
};

Event.prototype.update = function(name, description, time, image) {
    data = {
        name: name,
        slug: slug(name),
        description: description,
        time: new Date(time)
    };
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
};

Event.prototype.getTickets = function() {
    return db('event_tickets').select('ticket_id').where({event_id: this.id}).then(function(data) {
        return data.map(function(data) {
            return data.ticket_id
        });
    });
};

Event.prototype.setTickets = function(ticket_ids) {
    var this_event_id = this.id;
    return db('event_tickets').where({event_id: this_event_id}).del().then(function (){
        Promise.all(
            ticket_ids.map(function(ticket_id) {
                return db('event_tickets').insert({
                    event_id: this_event_id,
                    ticket_id: ticket_id
                });
            })
        );
    });
};

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
    });
};

Event.findById = function (id) {
    return db('events')
        .where({'id': id})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Event not found");
            return new Event(data);
        });
};

Event.findBySlugAndDate = function(slug, date) {
    return db('events').first().whereBetween('time', [
        date,
        new Date(date.getTime() + 24*60*60*1000)
    ]).andWhere({slug: slug}).then(function(data) {
        if (!data) throw httpError(404, "Event not found");
        return new Event(data);
    });
};

Event.search = function(query) {
    return db('events')
        .select(["name", "slug", "time"])
        .whereRaw("LOWER(name) LIKE '%' || LOWER(?) || '%' ", query);
};

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
        );
    });
};

Event.getFutureEvents = function(limit) {
    var limit = (typeof limit !== 'undefined') ? limit : 30;
    return db('events')
        .select()
        .where('time', '>', new Date())
        .orderBy('time', 'ASC')
        .limit(limit)
        .then(function(events) {
            return Promise.all(
                events.map(function(event_data){
                    return new Event(event_data);
                })
            );
        });
};

Event.getPastEvents = function() {
    return db('events').select().where('time', '<', new Date()).then(function(events) {
        return Promise.all(
            events.map(function(event_data){
                return new Event(event_data);
            })
        );
    });
};

module.exports = Event;
