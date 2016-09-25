var Position = require('../../models/blog.js');
var db = require('../../helpers/db');

var expect = require("chai").expect;

describe('Static Blog Methods', function() {
    it("can create a new blog post");
    it("can find a blog post");
    it("can get all blog posts");
});

describe('Blog Object', function() {
    it('can get its authors user object');
    it('can get its positions object');
    it('can update itself');
    it('can delete itself');
})
