import React from "react";
import ReactDOM from "react-dom";

import EventsCalendar from "./events/EventsCalendar";

import NewsFeed from "./news/NewsFeed";
import NewsRoutes from "./news/NewsRoutes";
import PaypalButton from "./debts/PaypalButton";
import ResponsiveMainMenu from "./common/ResponsiveMainMenu";

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

if (document.getElementById("main-menu")) {
    ReactDOM.render(
        <ResponsiveMainMenu username={document.getElementById("main-menu").getAttribute("data-username")}/>,
        document.getElementById("main-menu"),
    );
}

if (document.getElementById("paypal-button")) {
    const amount = document.getElementById("paypal-button").getAttribute("data-amount");
    const username = document.getElementById("paypal-button").getAttribute("data-username");
    ReactDOM.render(
        <PaypalButton
            amount={Number(amount)}
            username={username}
            onSuccess={() => window.location.replace("/services/debt")}
            onCancel={() => window.location.replace("/services/debt/pay/cancel")}/>,
        document.getElementById("paypal-button"),
    );
}

if (document.getElementById("news-routes")) {
    ReactDOM.render(
        <NewsRoutes/>,
        document.getElementById("news-routes"),
    );
}
