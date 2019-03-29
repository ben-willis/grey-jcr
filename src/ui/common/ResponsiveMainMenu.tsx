import MainMenu from "./MainMenu";
import { Responsive } from "semantic-ui-react";
import React from "react";

interface ResponsiveMainMenuProps {
    username?: string;
    admin: string;
}

export default class ResponsiveMainMenu extends React.Component<ResponsiveMainMenuProps> {
    public render() {
        return <div>
            <Responsive maxWidth="800">
                <MainMenu viewport="mobile" username={this.props.username} admin={this.props.admin}/>
            </Responsive>
            <Responsive minWidth="801" maxWidth="1141">
                <MainMenu viewport="tablet" username={this.props.username} admin={this.props.admin}/>
            </Responsive>
            <Responsive minWidth="1142">
                <MainMenu viewport="desktop" username={this.props.username} admin={this.props.admin}/>
            </Responsive>
        </div>
    }
}
