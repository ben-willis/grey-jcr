import React from "react";

import {storiesOf} from "@storybook/react";
import EventsCalendar from "./EventsCalendar";

storiesOf("Events Calendar", module)
    .add("January 2019", () => <EventsCalendar initialMonth={1} initialYear={2019}/>);
