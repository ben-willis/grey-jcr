import React from "react";

import {storiesOf} from "@storybook/react";
import ResponsiveMainMenu from "./ResponsiveMainMenu";

storiesOf("Main Menu", module)
    .add("with user", () => <ResponsiveMainMenu username="aaaa11"/>)
    .add("without user", () => <ResponsiveMainMenu/>);
