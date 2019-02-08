import React from "react";
import ReactDOM from "react-dom";

import EventsCalendar from "./events/EventsCalendar";

import NewsFeed from "./news/NewsFeed";

const now = new Date();
if (document.getElementById("events-calendar")) {
    ReactDOM.render(
        <EventsCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth() + 1}/>,
        document.getElementById("events-calendar"),
    );
}

if (document.getElementById("news-feed")) {
    ReactDOM.render(
        <NewsFeed/>,
        document.getElementById("news-feed"),
    );
}
