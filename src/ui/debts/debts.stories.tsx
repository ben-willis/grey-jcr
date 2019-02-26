import React from "react";

import {storiesOf} from "@storybook/react";
import PaypalButton from "./PaypalButton";

storiesOf("Paypal Button", module)
    .add("Paypal Button", () => <PaypalButton
        username="aaaa11"
        amount={500}
        onSuccess={console.log}
        onError={console.log}
        onCancel={console.log}
    />);
