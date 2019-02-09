import React from "react";
import NewsFilter from "./models/NewsFilter";
import NewsFilters from "./NewsFilters";
import NewsFeed from "./NewsFeed";

interface NewsAreaState {
    filter: NewsFilter;
}

export default class NewsArea extends React.Component<{}, NewsAreaState> {
    public constructor(props) {
        super(props);
        this.state = {filter: {}};
    }

    public render() {
        return (
            <div>
                <NewsFilters onFilterUpdate={(filter) => this.setState({filter})}/>
                <NewsFeed filter={this.state.filter}/>
            </div>  
        )
    }
}
