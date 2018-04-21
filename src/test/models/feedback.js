var models = require('../../models');

var expect = require("chai").expect;

describe('Feedback model', function() {
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

    it("it can find all feedback", function(done) {
        models.feedback.findAll().then(function(feedbacks) {
            expect(feedbacks).to.not.have.length(0);
            done();
        }).catch(done);
    });

    it("can find a piece of feedback by id", function(done) {
        models.feedback.findById(testFeedbackId).then(function(feedback) {
            expect(feedback).to.equal("Test Feedback");
        }).catch(done);
    });

    it("can add a reply", function(done) {
        models.feedback.findById(testFeedbackId).then(function(feedback) {
            return feedback.addReply({
                message: "test reply test test test"
            });
        }).then(function(feedback) {
            done();
        }).catch(done);
    });

    it("can list all replies", function(done) {
        models.feedback.findById(testFeedbackId).then(function(feedback) {
            return feedback.getReplies();
        }).then(function(feedbacks){
            expect(feedbacks).to.not.have.length(0);
            done();
        }).catch(done);
    });
});
