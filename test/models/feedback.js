var Feedback = require('../../models/feedback');
var db = require('../../helpers/db');

var expect = require("chai").expect;

describe('Static Feedback Methods', function() {
    var test_feedback_id = null;

    beforeEach(function(done) {
        db('feedbacks').insert({
            title: "Test Feedback",
            message: "This is a test",
            exec: false,
            read_by_user: true,
            anonymous: true,
            archived: false,
            author: 'hsdz38'
        }).returning('id').then(function(id) {
            test_feedback_id = id[0];
            done();
        });
    });

    afterEach(function(done) {
        db('feedbacks').del().then(function() {
            done();
        });
    })

    it("can find feedback by id", function(done) {
        Feedback.findById(test_feedback_id).then(function(feedback){
            expect(feedback.title).to.equal("Test Feedback");
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get all feedback", function(done) {
        Feedback.getAll(false).then(function(feedbacks) {
            expect(feedbacks).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get all feedback by a user", function(done) {
        Feedback.getAllByUser('hsdz38').then(function(feedbacks) {
            expect(feedbacks).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    })

    it("can create new feedback", function(done) {
        Feedback.create("Fake Feedback", "No Message", true, 'hsdz38').then(function(feedback) {
            expect(feedback.title).to.equal("Fake Feedback");
            done();
        }).catch(function(err){
            done(err);
        })
    })
});

describe('Feedback Object', function() {
    var test_feedback = null;

    beforeEach(function(done) {
        var now = new Date();
        db('feedbacks').insert({
            title: "Test Feedback",
            message: "This is a test",
            exec: false,
            read_by_user: true,
            anonymous: true,
            archived: false,
            created: now
        }).returning('id').then(function(id) {
            test_feedback = new Feedback({
                id: id[0],
                title: "Test Feedback",
                message: "This is a test",
                parent_id: null,
                exec: false,
                read_by_user: true,
                anonymous: true,
                archived: false,
                created: now,
                author: 'hsdz38'
            });
            done();
        });
    });

    afterEach(function(done) {
        db('feedbacks').del().then(function() {
            test_folder = null;
            done();
        });
    })

    it("can toggle archived state", function(done) {
        test_feedback.toggleArchived().then(function(){
            expect(this.archived).to.equal(true);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can add a reply", function(done) {
        test_feedback.addReply('test', true, 'hsdz38').then(function(){
            return db('feedbacks').select().where({
                parent_id: test_feedback.id
            })
        }).then(function(replies){
            expect(replies).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get all replies", function(done){
        db('feedbacks').insert({
            title: 'reply',
            message: 'test',
            parent_id: test_feedback.id,
            author: 'hsdz38',
            exec: true,
            read_by_user: false
        }).then(function(){
                return test_feedback.getReplies();
        }).then(function(replies) {
            expect(replies).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    });
});
