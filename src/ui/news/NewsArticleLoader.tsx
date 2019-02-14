import React from "react";
import Article from "../../news/entities/Article";
import greyAPI from "../greyAPI";
import { Message, Segment } from "semantic-ui-react";
import NewsArticle from "./NewsArticle";

interface NewsArticleLoaderProps {
    slug: string,
    year: number,
    month: number,
    date: number,
}

interface NewsArticleLoaderState {
    article?: Article,
    loading: boolean,
    error?: string,
}

export default class NewsArticleLoader extends React.Component<NewsArticleLoaderProps, NewsArticleLoaderState> {
    public constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    public componentWillMount() {
        this.getArticle();
    }
    
    public render() {
        if (this.state.loading) {
            return <Segment basic loading/>;
        } else if (this.state.article) {
            return <NewsArticle article={this.state.article}/>;
        } else {
            return <Message error>Something went wrong: {this.state.error}</Message>;
        }
    }

    private getArticle = () => {
        this.setState({loading: true, error: undefined});
        greyAPI.get<Article>("/news/" + this.props.year + "/" + this.props.month + "/" + this.props.date + "/" + this.props.slug).then((res) => {
            this.setState({
                article: res.data,
                loading: false,
            });
        }).catch((err) => {
            this.setState({
                loading: false,
                error: err.response.statusText,
            });
        });
    }
}