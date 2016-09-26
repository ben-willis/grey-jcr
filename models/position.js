var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');


/* Position Object */
var Position = function (data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.level = data.level;
}

Position.prototype.setDescription = function(description) {
    return db('positions').where({'id': this.id}).update({
        description: description
    });
}

Position.prototype.delete = function(){
    return db('positions').where({'id': this.id}).del();
}

Position.prototype.assignUser = function(username) {
    return db('user_positions')
        .insert({
            username: username,
            position_id: this.id
        })
}

Position.prototype.removeUser = function(username) {
    return db('user_positions').where({
        username: username,
        position_id: this.id
    }).del();
}

Position.prototype.getUsers = function() {
    return db('user_positions')
        .where({'position_id': this.id})
        .join('users', 'user_positions.username', '=', 'users.username')
        .select('users.name', 'users.email', 'users.username');
}

Position.prototype.getBlogs = function() {
    return db('blogs')
        .where({'position_id': this.id});
}

/* Static Methods */

Position.create = function (title, level) {
    return db('positions').insert({
        title: title,
        slug: slug(title),
        level: level
    }).returning("id").then(function(id){
        return new Position({
            id: id[0],
            title: title,
            slug: slug(title),
            level: level
        });
    })
}

Position.getAll = function () {
    return db('positions').select().then(function(positions) {
        return positions.map(function(data) {
            return new Position(data);
        })
    })
}

Position.findById = function (id) {
    return db('positions')
        .where({'id': id})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Position not found");
            return new Position(data)
        });
}

Position.findBySlug = function (slug) {
    return db('positions')
        .where({'slug': slug})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Position not found");
            return new Position(data)
        });
}

Position.getByLevel = function (sign, level) {
    return db('positions')
        .select()
        .where("level", sign, level)
        .then(function(positions) {
            return positions.map(function(data) {
                return new Position(data);
            })
        })
}

module.exports = Position;
