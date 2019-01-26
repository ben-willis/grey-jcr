import {configure, addDecorator} from "@storybook/react";
import {withInfo, setDefaults} from "@storybook/addon-info";
import StoryRouter from "storybook-react-router";

import "semantic-ui-less/semantic.less";

const req = require.context("../", true, /\.stories\.tsx$/);

function loadStories() {
    req.keys().forEach(filename => req(filename));
}

addDecorator(withInfo);
addDecorator(StoryRouter());
setDefaults({
    inline: true,
});

configure(loadStories, module);