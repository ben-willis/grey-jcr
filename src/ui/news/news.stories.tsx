import React from "react";

import {storiesOf} from "@storybook/react";
import { StateDecorator, Store } from "@sambego/storybook-state";
import { Message } from "semantic-ui-react";

import NewsArticle from "./NewsArticle";
import NewsFeed from "./NewsFeed";
import {articles} from "../../news/tests/newsFixtures";
import NewsFilters from "./NewsFilters";

const now = new Date();

storiesOf("News Article", module)
    .add("Full Article", () => <NewsArticle article={articles[0]}/>)
    .add("Article Summary", () => <NewsArticle article={articles[0]} initiallySummaryOnly/>);

storiesOf("News Feed", module)
    .add("Standard news feed", () => <NewsFeed/>)
    .add("Filtered news feed by query", () => <NewsFeed filter={{query: "Table"}}/>)
    .add("Filtered news feed by month", () => <NewsFeed filter={{month: now.getMonth() + 1, year: now.getFullYear()}}/>);

const store = new Store({
    filter: undefined
});

storiesOf("News Filter", module)
    .addDecorator(StateDecorator(store))
    .add("Plain news Filter", () => state => (
        <div>
            <NewsFilters onFilterUpdate={console.log}/>
            <Message>Check log for filter updated.</Message>
        </div>
    ))
    .add("News filter and feed", () => state => (
        <div>
            <NewsFilters onFilterUpdate={(filter => store.set({filter}))}/>
            <NewsFeed filter={state.filter}/>
        </div>
    ))
