import React from "react";
import ReactDOM from "react-dom";

import EventsCalendar from "./events/EventsCalendar";

import NewsFeed from "./news/NewsFeed";
import NewsRoutes from "./news/NewsRoutes";

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

if (document.getElementById("news-feed-role")) {
    ReactDOM.render(
        <NewsFeed filter={{roleId: Number(document.getElementById("news-feed-role").getAttribute("data-role"))}}/>,
        document.getElementById("news-feed-role"),
    );
}

if (document.getElementById("news-routes")) {
    ReactDOM.render(
        <NewsRoutes/>,
        document.getElementById("news-routes"),
    );
}