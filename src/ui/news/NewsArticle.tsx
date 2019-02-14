import React from "react";

import * as timeago from "timeago.js";

import Article from "../../news/entities/Article";
import { Segment, Header, Icon, Image, Divider, Grid, Button } from "semantic-ui-react";
import greyAPI from "../greyAPI";
import { Link } from "react-router-dom";

interface NewsArticleProps {
    article: Article;
    initiallySummaryOnly?: boolean;   
}

interface NewsArticleState {
    summaryOnly: boolean;
}

export default class NewsArticle extends React.Component<NewsArticleProps, NewsArticleState> {
    public constructor(props) {
        super(props);
        this.state = {
            summaryOnly: this.props.initiallySummaryOnly || false,
        }
    }

    public render() {
        const articlePath =
            "/jcr/blog/"
            + this.props.article.role.slug + "/"
            + new Date(this.props.article.updated).getFullYear() + "/"
            + (new Date(this.props.article.updated).getMonth() + 1) + "/"
            + new Date(this.props.article.updated).getDate() + "/"
            + this.props.article.slug

        const articleContent = this.state.summaryOnly && this.props.article.content
            ? this.props.article.content.replace("<[^>]*>", "").slice(0, 200) + "..."
            : this.props.article.content;

        return (
            <Segment>
                <Header as="h3">
                    <Image src={
                        greyAPI.defaults.baseURL + "/users/" +
                        this.props.article.authorUsername + "/avatar"
                    }/>
                    <Header.Content>
                        <a href={articlePath}>{this.props.article.title}</a>
                        <Header.Subheader>
                            <Icon name="user"/>
                            {this.props.article.author.name} ({this.props.article.role.title})
                            {" "}     
                            <Icon name="clock"/>
                            <span title={new Date(this.props.article.updated).toLocaleString()}>
                                {timeago.format(this.props.article.updated)}
                            </span>
                        </Header.Subheader>
                    </Header.Content>
                </Header>
                <Divider />
                <div dangerouslySetInnerHTML={{__html: articleContent}}/>
                <Divider />
                <Grid columns={2}>
                    <Grid.Column>
                    <Button
                            as="a"
                            size="mini"
                            color="twitter"
                            icon="twitter"
                            content="Tweet"
                            href={"https://twitter.com/share?url=" + encodeURIComponent("https://greyjcr.com" + articlePath)} />
                    </Grid.Column>
                    <Grid.Column textAlign="right">
                        {this.state.summaryOnly
                            && <a href="javascript:;" onClick={() => this.setState({summaryOnly: false})}>Read More</a>}
                    </Grid.Column>
                </Grid>
            </Segment>
        );
    }
}
