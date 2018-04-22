var models = require('../../models');

var expect = require("chai").expect;

describe('Blog model', function() {
	var testBlogId = null;

    it("can create a new blog", function(done) {
    	models.blog.create({
    		title: "Test Title",
    		slug: "Test-Title",
    		author_username: "abcd12",
    		role_id: 2
    	}).then(function(blog) {
    		testBlogId = blog.id;
    		expect(blog.title).to.equal("Test Title");
    		done();
    	}).catch(done);
    });

    it("can find a blog by id", function(done) {
    	models.blog.findById(testBlogId).then(function(blog) {
    		expect(blog.title).to.equal("Test Title");
    		done();
    	}).catch(done);
    });

    it("can find a blog by slug and time", function(done) {
    	models.blog.findOne({
    		where: {slug: "Test-Title"}
    	}).then(function(blog) {
    		expect(blog.id).to.equal(testBlogId);
    		done();
    	}).catch(done);
    });

    it("can get all blogs", function(done) {
        models.blog.findAll().then(function(blogs) {
            expect(blogs).to.not.have.length(0);
            done();
        }).catch(done);
    });

    it("can edit a blog", function(done) {
    	models.blog.findById(testBlogId).then(function(blog) {
    		return blog.update({
    			message: "TEST MESSAGE"
    		});
    	}).then(function(blog) {
    		expect(blog.message).to.equal("TEST MESSAGE");
    		done();
    	}).catch(done);
    });

    it("can delete a blog", function(done) {
    	models.blog.findById(testBlogId).then(function(blog) {
    		return blog.destroy();
    	}).then(function() {
    		done();
    	}).catch(done);
    });
});