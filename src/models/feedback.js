var db = require('../helpers/db');
var httpError = require('http-errors');

/* Folder Object*/
var Feedback = function (data) {
    this.id = data.id;
    this.title = data.title;
    this.message = data.message;
    this.parent_id = data.parent_id;
    this.exec = data.exec;
    this.read_by_user = data.read_by_user;
    this.anonymous = data.anonymous;
    this.archived = data.archived;
    this.created = data.created;
    this.author = data.author;
}
;
Feedback.prototype.toggleArchived = function () {
    var archived = this.archived;
    return db('feedbacks').update('archived', !archived).where({id: this.id}).then(function(){
        this.archived = !archived;
        return;
    });
};

Feedback.prototype.setReadByUser = function () {
    return db('feedbacks').update('read_by_user', true).where({id: this.id}).then(function(){
        this.read_by_user = true;
        return;
    }.bind(this));
};

Feedback.prototype.setUnreadByUser = function () {
    return db('feedbacks').update('read_by_user', false).where({id: this.id}).then(function(){
        this.read_by_user = false;
        return;
    }.bind(this));
};

Feedback.prototype.addReply = function(message, exec, author) {
    return db('feedbacks').insert({
        title: 'reply',
        message: message,
        author: author,
        exec: exec,
        parent_id: this.id,
        read_by_user: !exec
    }).then(function(){
        if (this.archived) {
            return this.toggleArchived();
        } else {
            return;
        }
    }.bind(this)).then(function() {
        if (exec) {
            return this.setUnreadByUser();
        } else {
            return;
        }
    }.bind(this));
};

Feedback.prototype.getReplies = function () {
    return db('feedbacks')
        .select()
        .orderBy('created', 'ASC')
        .where('parent_id', this.id);
};

/* Static Methods */

Feedback.create = function(title, message, anonymous, author) {
    return db('feedbacks').insert({
        title: title,
        message: message,
        exec: false,
        read_by_user: true,
        anonymous: anonymous,
        author: author,
        archived: false
    }).returning('id').then(function(id){
        return new Feedback({
            id: id[0],
            title: title,
            message: message,
            parent_id: null,
            exec: false,
            archived: false,
            read_by_user: true,
            anonymous: anonymous,
            author: author
        });
    });
};

Feedback.findById = function(feedback_id) {
    return db('feedbacks').first().where({
        id: feedback_id
    }).then(function(data) {
        if (!data) throw httpError(404, "Feedback not found");
        return new Feedback(data);
    });
};

Feedback.getAll = function(archived) {
    return db('feedbacks')
        .select()
        .where({parent_id: null, archived: archived})
        .orderBy('created', 'DESC')
        .then(function(feedbacks) {
            return Promise.all(
                feedbacks.map(function(feedback_data){
                    return new Feedback(feedback_data);
                })
            );
        });
};

Feedback.getAllByUser = function(username) {
    return db('feedbacks').select().where({
        parent_id: null,
        author: username
    }).then(function(feedbacks) {
        return Promise.all(
            feedbacks.map(function(feedback_data){
                return new Feedback(feedback_data);
            })
        );
    });
};

module.exports = Feedback;
