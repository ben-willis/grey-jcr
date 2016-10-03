var db = require('../helpers/db');
var httpError = require('http-errors');
var slug = require('slug');

/* Blog Object*/
var Blog = function (data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.message = data.message;
    this.author = data.author;
    this.role_id = data.role_id;
    this.updated = new Date(data.updated);

    this.permalink = this.updated.getFullYear()+"/"+(this.updated.getMonth()+1)+"/"+this.updated.getDate()+"/"+this.slug
}

Blog.prototype.getRole = function () {
    return db('roles').first().where({id: this.role_id});
};

Blog.prototype.getAuthor = function () {
    return db('users').first().where({username: this.author});
};

Blog.prototype.update = function(data) {
    return db('blogs').where({id: this.id}).update({
        title: data.title,
        message: data.message
    }).then(function() {
        this.title = data.title;
        this.message = data.message;
        return;
    })
}

Blog.prototype.delete = function() {
    return db('blogs').where({id: this.id}).del();
}

/* Static Methods */

Blog.create = function(data) {
    return db('blogs').returning('id').insert({
        title: data.title,
        slug: slug(data.title),
        message: data.message,
        author: data.author,
        role_id: data.role_id
    }).then(function(id) {
        return new Blog({
            id: id[0],
            title: data.title,
            slug: slug(data.title),
            message: data.message,
            author: data.author,
            role_id: data.role_id
        })
    })
}

Blog.findById = function(id) {
    return db('blogs').first().where({id: id}).then(function(data) {
        if (!data) throw httpError(404, "Blog not found");
        return new Blog(data)
    })
}

Blog.findBySlugAndDate = function(slug, date) {
    return db('blogs').first().whereBetween('updated', [
        date,
        new Date(date.getTime() + 24*60*60*1000)
    ]).andWhere({slug: slug}).then(function(data) {
        if (!data) throw httpError(404, "Blog not found");
        return new Blog(data)
    });
}


Blog.getAll = function() {
    return db('blogs').select().orderBy('updated', 'desc').then(function(data_array) {
        return data_array.map(function(data) {
            return new Blog(data)
        });
    })
}

module.exports = Blog;
