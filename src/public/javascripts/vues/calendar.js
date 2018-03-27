Vue.component('day', {
    props: ['cellNo'],
    computed: {
        day: function () {return this.cellNo - this.$root.startNo + 1},
        date: function () { return new Date(this.$root.year, this.$root.month - 1, this.day)},
        currentMonth: function () {return (this.date.getMonth() + 1 == this.$root.month)},
        events: function () {
            var day = this.day;
            return events = (this.$root.allEvents).filter(
                function (item) {
                    return (item.time.getDate() == day);
                }
            );
        }
    },
    template: '<div class="cell"><div class="ui sub header" v-if="currentMonth">{{ day }}</div><event v-for="event in events" :event-name="event.name" :time="event.time" :slug="event.slug"></event></div>',
    components: {
        'event': {
            props: ['eventName', 'time', 'slug'],
            computed: {
                permalink: function () {
                    return '/events/'+this.time.getFullYear()+'/'+(this.time.getMonth()+1)+'/'+this.time.getDate()+'/'+this.slug
                }
            },
            template: '<a class="ui label" :href="permalink">{{ eventName }}</a>'
        }
    }
});

var calendar = new Vue({
    el: "#calendar",
    data: {
        months: ["January", "February", "March","April", "May", "June","July", "August", "September","October", "November", "December"],
        year: (new Date()).getFullYear(),
        month: (new Date()).getMonth()+1,
        allEvents: []
    },
    computed: {
        start: function () { return new Date(this.year, this.month-1, 1) },
        startNo: function () {
            startNo = this.start.getDay();
            return (startNo==0) ? 7: startNo;
        },
        end: function () { return new Date(this.year, this.month, 0) },
        days: function () { return this.end.getDate(); },
        weeks: function () {
            var weeks = (this.days%7 == 0 ? 0 : 1) + Math.floor(this.days/7)
            return ((this.end.getDay()+6)%7 < (this.start.getDay()+6)%7) ? weeks + 1 : weeks;
        }
    },
    methods: {
        fetchEvents: function() {
            var self = this;
            $("#calendar").addClass('loading');
            $.get('/api/events/'+self.year+'/'+self.month, function(events) {
                if (!events) {
                    self.allEvents = [];
                } else {
                    for (var i = 0; i < events.length; i++ ){
                        events[i].time = new Date(events[i].time)
                    }
                    self.allEvents = events;
                    $("#calendar").removeClass('loading');
                }
            }, 'json');
        },
        prevMonth: function () {
            if (this.month == 1) {
                this.month = 12;
                this.year = this.year - 1;
            } else {
                this.month = this.month - 1;
            }
        },
        nextMonth: function () {
            if (this.month == 12) {
                this.month = 1;
                this.year = this.year + 1;
            } else {
                this.month = this.month + 1;
            }
        }
    },
    created: function() { this.fetchEvents(); },
    watch:{
        'year': 'fetchEvents',
        'month': 'fetchEvents'
    }
});
