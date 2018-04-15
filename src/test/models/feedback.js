var models = require('../../models');

var expect = require("chai").expect;

describe.skip('Feedback model', function() {
    var testFeedbackId = null;

    it("can create a piece of feedback", function(done) {
        models.feedback.create({
            title: "Test Feedback",
            message: "test test test test",
            anonymous: false,
            author: "abcd12",
            exec: false
        }).then(function(feedback) {
            expect(feedback.title).to.equal("Test Feedback");
            testFeedbackId = feedback.id;
            done();
        }).catch(done);
    });

    it("can add a reply");

    it("can list all replies");
});
