import React from "react";
import NewsFilter from "./models/NewsFilter";
import NewsFilters from "./NewsFilters";
import NewsFeed from "./NewsFeed";
import { BrowserRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import NewsArticle from "./NewsArticle";
import NewsArea from "./NewsArea";
import NewsArticleLoader from "./NewsArticleLoader";

export default class NewsRoutes extends React.Component<{}> {
    public render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/jcr/blog" component={NewsArea}/>
                    <Route exact path="/jcr/blog/:roleSlug/:year/:month/:date/:slug" render={(props) => (
                        <NewsArticleLoader
                            slug={props.match.params.slug}
                            year={Number(props.match.params.year)}
                            month={Number(props.match.params.month)}
                            date={Number(props.match.params.date)}
                        />
                    )}/>
                </Switch>
            </Router>
        )
    }
}