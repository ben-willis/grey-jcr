var Blog = require('../../models/blog');
var db = require('../../helpers/db');
var slug = require('slug');

var expect = require("chai").expect;

describe('Static Blog Methods', function() {
    created_blog_id = null;

    beforeEach(function(done) {
        // Create fake user and position
        Promise.all([
            db('positions').insert({
                title: "Test Position",
                slug: "test-position",
                description: "test",
                level: 5
            }).returning('id'),
            db('users').insert({
                username: "abcd12",
                email: "abcd@efg.com",
                name: "Abc Def"
            }).returning('username')
        ]).then(function(ids) {
            // Create fake blog post
            return db('blogs').insert({
                title: "Test",
                slug: "Test",
                message: "Test Message",
                author: "abcd12",
                position_id: ids[0][0]
            }).returning('id');
        }).then(function(id) {
            created_blog_id = id[0];
            done();
        }).catch(function(err){
            done(err);
        });
    });

    afterEach(function(done) {
        Promise.all([
            db('blogs').del(),
            db('positions').del(),
            db('users').del()
        ]).then(function() {
            created_blog_id = null;
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it("can create a new blog", function(done) {
        Blog.create({
            title: "Test 2",
            slug: "Test 2",
            message: "Test 2 Message",
            author: "abcd12",
            position_id: 1
        }).then(function(blog) {
            expect(blog.title).to.equal("Test 2");
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it("can find a blog by id", function(done){
        Blog.findById(created_blog_id).then(function(blog) {
            expect(blog.title).to.equal("Test");
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it("can find a blog by slug and time");

    it("can get all blogs", function(done) {
        Blog.getAll().then(function(blogs) {
            expect(blogs).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        });
    });
});

describe('Blog Object', function() {
    blog = null;

    beforeEach(function(done) {
        // Create fake user and position
        Promise.all([
            db('positions').insert({
                title: "Test Position",
                slug: "test-position",
                description: "test",
                level: 5
            }).returning('id'),
            db('users').insert({
                username: "abcd12",
                email: "abcd@efg.com",
                name: "Abc Def"
            }).returning('username')
        ]).then(function(ids) {
            // Create fake blog post
            return db('blogs').insert({
                title: "Test",
                slug: "Test",
                message: "Test Message",
                author: "abcd12",
                position_id: ids[0][0]
            }).returning('id');
        }).then(function(id) {
            return db('blogs').first().where({id: id[0]});
        }).then(function(blog_data){
            blog = new Blog(blog_data);
            done();
        }).catch(function(err){
            done(err);
        });
    });

    afterEach(function(done) {
        Promise.all([
            db('blogs').del(),
            db('positions').del(),
            db('users').del()
        ]).then(function() {
            blog = null;
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it('can get its authors user data', function(done){
        blog.getAuthor().then(function(author) {
            expect(author.name).to.equal("Abc Def");
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it('can get its positions data', function(done){
        blog.getPosition().then(function(position) {
            expect(position.title).to.equal("Test Position");
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it('can update itself', function(done){
        blog.update({
            title: "New Title",
            message: "New Message"
        }).then(function() {
            expect(this.title).to.equal("New Title");
            done();
        }).catch(function(err){
            done(err);
        });
    });

    it('can delete itself', function(done){
        blog.delete().then(function() {
            return db('blogs').select();
        }).then(function(blogs){
            expect(blogs).to.have.length(0);
            done();
        }).catch(function(err){
            done(err);
        });
    });
})
