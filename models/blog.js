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

    this.permalink = this.updated.getFullYear()+"/"+(this.updated.getMonth()+1)+"/"+this.updated.getDate()+"/"+this.slug;
};

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
    });
};

Blog.prototype.delete = function() {
    return db('blogs').where({id: this.id}).del();
};

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
        });
    });
};

Blog.findById = function(id) {
    return db('blogs').first().where({id: id}).then(function(data) {
        if (!data) throw httpError(404, "Blog not found");
        var blog = new Blog(data);
        return Promise.all([
            blog,
            blog.getRole(),
            blog.getAuthor()
        ]);
    }).then(function(data) {
        var blog = data[0];
        blog.role = data[1];
        blog.author = data[2];
        return blog;
    });
};

Blog.findBySlugAndDate = function(slug, date) {
    return db('blogs').first().whereBetween('updated', [
        date,
        new Date(date.getTime() + 24*60*60*1000)
    ]).andWhere({slug: slug}).then(function(data) {
        if (!data) throw httpError(404, "Blog not found");
        var blog = new Blog(data);
        return Promise.all([
            blog,
            blog.getRole(),
            blog.getAuthor()
        ]);
    }).then(function(data) {
        var blog = data[0];
        blog.role = data[1];
        blog.author = data[2];
        return blog;
    });
};

Blog.search = function(query) {
    return db('blogs')
        .select()
        .whereRaw("LOWER(title) LIKE '%' || LOWER(?) || '%' ", query)
        .then(function(data){
            return Promise.all(
                data.map(function(blog_data) {
                    var blog = new Blog(blog_data);
                    return blog.getRole().then(function(role) {
                        return {
                            title: blog_data.title,
                            updated: new Date(blog_data.updated),
                            slug: blog_data.slug,
                            role: role
                        };
                    });
                })
            );
        });
};


Blog.get = function(role_id, year, month) {
    var blogs_promise = db('blogs').select().orderBy('updated', 'desc');

    if (role_id) {
        blogs_promise = blogs_promise.andWhere('role_id', role_id);
    }
    if (year && month) {
        blogs_promise = blogs_promise.andWhereBetween('updated', [
            new Date(year, month-1, 1),
            new Date(year, month, 1)
        ]);
    }

    return blogs_promise.then(function(data_array) {
        return Promise.all(
            data_array.map(function(blog_data) {
                var blog = new Blog(blog_data);
                return Promise.all([
                    blog.getRole(),
                    blog.getAuthor()
                ]).then(function(data) {
                    blog = new Blog(blog_data);
                    blog.role = data[0];
                    blog.author = data[1];
                    return blog;
                });
            })
        );
    });
};

Blog.getByDateRange = function(start_date, end_date) {
    var limit = (typeof limit !== 'undefined') ? limit : 30;
    return db('blogs')
        .select()
        .whereBetween('updated', [
            start_date,
            end_date
        ])
        .orderBy('updated', 'desc')
        .then(function(data_array) {
            return Promise.all(
                data_array.map(function(blog_data) {
                    var blog = new Blog(blog_data);
                    return Promise.all([
                        blog.getRole(),
                        blog.getAuthor()
                    ]).then(function(data) {
                        blog = new Blog(blog_data);
                        blog.role = data[0];
                        blog.author = data[1];
                        return blog;
                    });
                })
            );
        });
};

module.exports = Blog;
