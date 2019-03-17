import MainMenu from "./MainMenu";
import { Responsive } from "semantic-ui-react";
import React from "react";

interface ResponsiveMainMenuProps {
    username?: string;
}

export default class ResponsiveMainMenu extends React.Component<ResponsiveMainMenuProps> {
    public render() {
        return <div>
            <Responsive maxWidth="767">
                <MainMenu viewport="mobile" username={this.props.username} />
            </Responsive>
            <Responsive minWidth="768" maxWidth="991">
                <MainMenu viewport="tablet" username={this.props.username}/>
            </Responsive>
            <Responsive minWidth="992">
                <MainMenu viewport="desktop" username={this.props.username}/>
            </Responsive>
        </div>
    }
}