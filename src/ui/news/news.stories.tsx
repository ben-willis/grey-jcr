import React from "react";

import {storiesOf} from "@storybook/react";
import NewsArticle from "./NewsArticle";
import Article from "../../news/entities/Article";

import faker from "faker";

const mockArticles: Article[] = Array(20).fill(undefined).map((n, id) => ({
    id: id + 1,
    title: faker.commerce.productName(),
    slug: faker.lorem.slug(),
    content: "<p>" + faker.lorem.paragraphs(3, "</p><p>") + "</p>",
    updated: faker.date.past(),
    roleId: faker.random.number(30),
    role: {
        id: faker.random.number(30),
        title: faker.name.jobTitle(),
        slug: faker.lorem.slug(),
        level: faker.random.number(5),
    },
    authorUsername: faker.random.alphaNumeric(6),
    author: {
        email: faker.internet.email(),
        username: faker.random.alphaNumeric(6),
        name: faker.name.findName(),
        last_login: faker.date.past(),
    },
}));

console.log(mockArticles);

storiesOf("News Article", module)
    .add("Full Article", () => <NewsArticle article={mockArticles[0]}/>)
    .add("Article Summary", () => <NewsArticle article={mockArticles[1]} initiallySummaryOnly/>);
