import React from "react";
import ReactDOM from "react-dom";

import EventsCalendar from "./events/EventsCalendar";

const now = new Date();
ReactDOM.render(
    <EventsCalendar initialYear={now.getFullYear()} initialMonth={now.getMonth() + 1}/>,
    document.getElementById("events-calendar"),
);
