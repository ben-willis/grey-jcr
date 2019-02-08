import React from "react";

import Article from "../../news/entities/Article";
import { Segment, Header, Icon, Image, Divider, Grid, Button, Visibility, Message } from "semantic-ui-react";
import greyAPI from "../greyAPI";
import NewsArticle from "./NewsArticle";
import NewsFilter from "./models/newsFilter";

interface NewsFeedProps {
    filter?: NewsFilter;
}

interface NewsFeedState {
    articles: Article[];
    page: number;
    loading: boolean;
    allArticlesLoaded: boolean;
    error?: string;
}

export default class NewsFeed extends React.Component<NewsFeedProps, NewsFeedState> {
    public constructor(props) {
        super(props);
        this.state = {
            articles: [],
            page: 1,
            loading: true,
            allArticlesLoaded: false,
        }
    }

    public componentDidMount() {
        this.getMoreArticles();
    }

    public render() {
        return (
            <div>
                {this.state.articles.map((article) => (
                    <NewsArticle key={article.id} article={article} initiallySummaryOnly/>
                ))}
                <Visibility once={false} onTopVisible={this.getMoreArticles}>
                    {this.state.error && <Message error>Something went wrong</Message>}
                    {this.state.allArticlesLoaded && <Message>No more news</Message>}
                    {!this.state.allArticlesLoaded && !this.state.error &&
                        <Segment basic loading={this.state.loading}/>
                    }
                </Visibility>
            </div>
        );
    }

    private getMoreArticles = () => {
        if (this.state.allArticlesLoaded) return;

        this.setState({loading: true});

        greyAPI.get<Article[]>("/news", {
            params: {
                limit: 10,
                page: this.state.page,
                q: this.props.filter ? this.props.filter.query : undefined,
                role: this.props.filter ? this.props.filter.roleId : undefined,
                author: this.props.filter ? this.props.filter.author : undefined,
                year: this.props.filter ? this.props.filter.year : undefined,
                month: this.props.filter ? this.props.filter.month : undefined,
            }
        }).then((res) => {
            this.setState((prevState) => ({
                articles: prevState.articles.concat(res.data),
                page: prevState.page + 1,
                loading: false,
                allArticlesLoaded: (res.data.length < 10),
                error: undefined,
            }));
        }).catch((err) => {
            this.setState({error: err});
            console.log(err);
        });
    }
}
