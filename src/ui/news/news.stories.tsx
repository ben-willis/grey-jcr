import React from "react";

import {storiesOf} from "@storybook/react";
import NewsArticle from "./NewsArticle";
import Article from "../../news/entities/Article";

import faker from "faker";
import NewsFeed from "./NewsFeed";

import {articles} from "../../news/tests/newsFixtures";

const now = new Date();

storiesOf("News Article", module)
    .add("Full Article", () => <NewsArticle article={articles[0]}/>)
    .add("Article Summary", () => <NewsArticle article={articles[0]} initiallySummaryOnly/>);

storiesOf("News Feed", module)
    .add("Standard news feed", () => <NewsFeed/>)
    .add("Filtered news feed by query", () => <NewsFeed filter={{query: "Table"}}/>)
    .add("Filtered news feed by month", () => <NewsFeed filter={{month: now.getMonth() + 1, year: now.getFullYear()}}/>);
