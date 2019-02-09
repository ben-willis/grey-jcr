import React from "react";
import NewsFilter from "./models/NewsFilter";
import { Menu, Dropdown, Input, InputOnChangeData, Icon } from "semantic-ui-react";

interface NewsFiltersProps {
    onFilterUpdate: (filter: NewsFilter) => any;
}

interface NewsFiltersState {
    role?: number;
    year?: number;
    month?: number;
    query: string;
}

export default class NewsFilters extends React.Component<NewsFiltersProps, NewsFiltersState> {
    public constructor(props) {
        super(props);
        this.state = {query: ""}
    }

    public render() {
        return (
            <Menu secondary>
                <Menu.Item>
                    <Input icon="search" placeholder="Search..." onChange={this.handleQueryChange} value={this.state.query}/>
                </Menu.Item>
                <Menu.Item position="right" onClick={this.clearFilters} icon="delete" content="Clear Filters"/>
            </Menu>
        );
    }

    private handleQueryChange = (e, data: InputOnChangeData) => {
        this.setState({query: data.value}, this.handleFilterChange);
    }

    private clearFilters = (e, d) => {
        this.setState({
            query: "",
            year: undefined,
            month: undefined,
            role: undefined,
        }, this.handleFilterChange)
    }

    private handleFilterChange = () => {
        this.props.onFilterUpdate({
            query: this.state.query
        })
    }
}