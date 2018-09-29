var notifications = new Vue({
    el: "#top_menu",
    data: {
        unread_feedbacks: 0,
        unread_blogs: 0,
        unvoted_elections: 0
    },
    methods: {
        fetchFeedback: function() {
            $.get('/api/feedbacks', function(data) {
                if (!data.feedbacks) {
                    this.unread_feedbacks = 0;
                } else {
                    this.unread_feedbacks = data.feedbacks.filter(function(feedback) {
                        return (!feedback.read_by_user);
                    }).length;
                }
            }.bind(this), 'json');
        },
        fetchBlogs: function() {
            $.get('/api/blogs/unread', function(data) {
                if (!data.blogs) {
                    this.unread_blogs = 0;
                } else {
                    this.unread_blogs = data.blogs.length;
                }
            }.bind(this), 'json');
        },
        fetchElections: function() {
            $.get('/api/elections/2', function(data) {
                if (!data.elections) {
                    this.unvoted_elections = 0;
                } else {
                    this.unvoted_elections = data.elections.filter(function(election) {
                        return (!election.voted);
                    }).length;
                }
            }.bind(this), 'json');
        }
    },
    created: function() {
        this.fetchElections();
        this.fetchBlogs();
        this.fetchFeedback();
    },
    mounted: function() {
        $('.ui.dropdown.link.item').dropdown({action: 'hide'});
    }
})
