var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');


/* Role Object */
var Role = function (data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.level = data.level;
}

Role.prototype.setDescription = function(description) {
    return db('roles').where({'id': this.id}).update({
        description: description
    });
}

Role.prototype.delete = function(){
    return db('roles').where({'id': this.id}).del();
}

Role.prototype.assignUser = function(username) {
    return db('user_roles')
        .insert({
            username: username,
            role_id: this.id
        })
}

Role.prototype.removeUser = function(username) {
    return db('user_roles').where({
        username: username,
        role_id: this.id
    }).del();
}

Role.prototype.getUsers = function() {
    return db('user_roles')
        .where({'role_id': this.id})
        .join('users', 'user_roles.username', '=', 'users.username')
        .select('users.name', 'users.email', 'users.username');
}

Role.prototype.getBlogs = function() {
    return db('blogs')
        .select('id')
        .where({'role_id': this.id})
        .then(function(blogs) {
            return blogs.map(function(data) {
                return data.id;
            })
        });
}

/* Static Methods */

Role.create = function (title, level) {
    return db('roles').insert({
        title: title,
        slug: slug(title),
        level: level
    }).returning("id").then(function(id){
        return new Role({
            id: id[0],
            title: title,
            slug: slug(title),
            level: level
        });
    })
}

Role.getAll = function () {
    return db('roles').select().then(function(roles) {
        return roles.map(function(data) {
            return new Role(data);
        })
    })
}

Role.findById = function (id) {
    return db('roles')
        .where({'id': id})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Role not found");
            return new Role(data)
        });
}

Role.findBySlug = function (slug) {
    return db('roles')
        .where({'slug': slug})
        .first()
        .then(function(data) {
            if (!data) throw httpError(404, "Role not found");
            return new Role(data)
        });
}

Role.getByType = function (type) {
    promise = db('roles').select();
    switch(type) {
        case "exec":
            promise = promise.where("level", ">=", 4).andWhereNot("id", "=", 1);
            break;
        case "admin":
            promise = promise.where("level", "=", 5);
            break;
        case "officer":
            promise = promise.where("level", "=", 3).orWhere("id", "=", 1);
            break;
        case "welfare":
            promise = promise.where("level", "=", 2).orWhere("slug", "=", "male-welfare-officer").orWhere("slug", "=", "female-welfare-officer");
            break;
        case "rep":
            promise = promise.where("level", "=", 1);
            break;

    }
    return promise.then(function(roles) {
        return roles.map(function(role_data) {
            return new Role(role_data);
        })
    });
}

module.exports = Role;
