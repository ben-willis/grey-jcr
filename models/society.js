var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');


/* Society Object */
var Society = function (data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug
    this.type = data.type;
    this.description = data.description;
    this.facebook = data.facebook;
    this.twitter = data.twitter;
    this.email = data.description;
}

Society.prototype.update = function(title, description, facebook, twitter, email, type) {
    return db('societies').where({'id': this.id}).update({
        title: title,
        slug: slug(title),
        description: description,
        facebook: facebook,
        twitter: twitter,
        email: email,
        type: type
    });
}

Society.prototype.delete = function(){
    return db('societies').where({'id': this.id}).del();
}

/* Static Methods */

Society.create = function (title, type) {
    return db('societies').insert({
        title: title,
        slug: slug(title),
        type: type
    }).returning("id").then(function(id){
        return new Society({
            id: id[0],
            title: title,
            slug: slug(title),
            description: null,
            facebook: null,
            twitter: null,
            email: null,
            type: type
        });
    })
}

Society.getAll = function () {
    return db('societies').select().then(function(societies) {
        return societies.map(function(data) {
            return new Society(data);
        })
    })
}

Society.findById = function (id) {
    return db('societies')
        .where({'id': id})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Society not found");
            return new Society(data)
        });
}

Society.findBySlug = function (slug) {
    return db('societies')
        .where({'slug': slug})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Society not found");
            return new Society(data)
        });
}

Society.getByType = function (type) {
    promise = db('societies').select();
    switch(type) {
        case "sport":
            promise = promise.where("type", "=", 1);
            break;
        case "society":
            promise = promise.where("type", "=", 0);
            break;

    }
    return promise.then(function(societies) {
        return societies.map(function(society_data) {
            return new Society(society_data);
        })
    });
}

module.exports = Society;
