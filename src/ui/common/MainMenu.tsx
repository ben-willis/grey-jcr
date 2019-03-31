import React from "react";
import { Menu, Icon, Input, Image, Dropdown, Grid, Header, Search } from "semantic-ui-react";

import menuItems from "./menuItems";
import greyAPI from "../greyAPI";

interface MainMenuProps {
    viewport: "mobile"|"tablet"|"desktop"
    username?: string
    admin: string
}

interface MainMenuState {
    searchValue: string;
    searchLoading: boolean;
    searchResults: Object;
}

export default class MainMenu extends React.Component<MainMenuProps, MainMenuState> {
    public constructor(props) {
        super(props);
        this.state = {
            searchValue: "",
            searchLoading: false,
            searchResults: {},
        }
    }

    public render() {
        const menuItemsToDisplay = this.props.username ? menuItems : menuItems.filter(mu => !mu.usersOnly && mu.name !== "admin");
        const visibleItems = (this.props.viewport === "desktop") ? 6 : 5;

        const mainMenuItems = menuItemsToDisplay.slice(0, visibleItems - 1);
        const subMenuItems = menuItemsToDisplay.slice(visibleItems - 1);

        const adminMenuItem = menuItems.find(mu => mu.name === "admin");

        return <div className="main-menu-container">
            <Grid inverted container stackable={this.props.viewport === "mobile"} columns="equal" verticalAlign="middle">
                <Grid.Column>
                    <Menu secondary inverted icon="labeled" size="small" widths={visibleItems}>
                        {mainMenuItems.map(menuItem => (
                            <Menu.Item name={menuItem.name} href={menuItem.path}>
                                <Icon name={menuItem.icon}/>
                                {menuItem.label}
                            </Menu.Item>
                        ))}
                        <Dropdown trigger={
                            <Menu.Item link>
                                <Icon name="th"/>
                                <span>More <Icon name="dropdown"/></span>
                            </Menu.Item>
                        } icon={null}>
                            <Dropdown.Menu direction="left">
                                {subMenuItems.map(menuItem => (
                                    <Dropdown.Item href={menuItem.path}>
                                        <Icon name={menuItem.icon}/>
                                        {menuItem.label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu>
                </Grid.Column>
                {(this.props.viewport === "desktop") && <Grid.Column>
                    <Header textAlign="center" inverted>
                        <Image src={require("../static/header-crest.png")}/>
                    </Header>
                </Grid.Column>}
                <Grid.Column textAlign={this.props.viewport === "mobile" ? "center" : "right"}>
                    <Menu secondary inverted compact height="100%">
                        <Search
                            fluid
                            category
                            placeholder="Search..."
                            className="item"
                            value={this.state.searchValue}
                            loading={this.state.searchLoading}
                            results={this.state.searchResults}
                            onSearchChange={this.handleSearchChange}
                        />
                        {(this.props.admin === "true") &&
                            <Menu.Item name={adminMenuItem.name} href={adminMenuItem.path} fitted="horizontally">
                                {adminMenuItem.label}
                            </Menu.Item>}
                        {this.props.username && <Dropdown item trigger={
                            <Image
                                circular
                                bordered
                                size="mini"
                                src={greyAPI.defaults.baseURL + "/users/" + this.props.username + "/avatar"}/>
                            }>
                            <Dropdown.Menu direction="left">
                                <Dropdown.Header>{this.props.username}</Dropdown.Header>
                                <Dropdown.Item href={"/services/user/" + this.props.username}>
                                    View Profile
                                </Dropdown.Item>
                                <Dropdown.Item href={"/services/user/" + this.props.username + "/update"}>
                                    Update Profile
                                </Dropdown.Item>
                                <Dropdown.Item href="/services/debt">
                                    My Debts
                                </Dropdown.Item>
                                <Dropdown.Item href="/logout">
                                    <Icon name="log out"/>
                                    Log Out
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown> || <Menu.Item href="/login">Login</Menu.Item>}
                    </Menu>
                </Grid.Column>
            </Grid>
        </div>
    }

    public handleSearchChange = async (e, {value}: {value: string}) => {
        this.setState({searchLoading: true, searchValue: value});

        if (value === "") {
            this.setState({
                searchLoading: false,
                searchResults: {},
            });
        } else {
            const searchResults = await greyAPI.get("/search?q=" + encodeURI(value)).then((res) => res.data.results);

            this.setState({
                searchLoading: false,
                searchResults,
            });
        }
    }
}
