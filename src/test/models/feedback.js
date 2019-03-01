var Feedback = require('../../models/feedback');
var db = require('../../helpers/db');

var expect = require("chai").expect;

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
});
