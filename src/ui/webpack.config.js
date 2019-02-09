// tslint:disable-next-line:no-var-requires
require("dotenv").config();

const webpack = require("webpack");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    entry: path.resolve(__dirname, "./index.tsx"),
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../../dist/ui"),
        publicPath: "/"
    },

    devtool: "source-map",

    resolve: {
        alias: {
            "../../theme.config$": path.join(__dirname, './semantic-theme/theme.config'),
            typeorm: path.resolve(__dirname, "../../node_modules/typeorm/typeorm-model-shim")
        },
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            { test: /\.css$/, loader: "css-loader"},
            { 
                test: /\.(le|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
            },
            { test: /\.tsx?$/, loader: "ts-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
                test: /\.jpe?g$|\.gif$|\.png$|\.ttf$|\.eot$|\.svg$/,
                use: 'file-loader?name=[name].[ext]?[hash]'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/fontwoff'
            }
        ]
    },

    externals: {
        "paypal-checkout": "paypal",
        "react": "React",
        "react-dom": "ReactDOM"
    },

    plugins: [
    //   new DynamicCdnWebpackPlugin(),
      new BundleAnalyzerPlugin({analyzerMode: "static", openAnalyzer: false}),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({
            GREY_API_URL: JSON.stringify(process.env.NODE_ENV === "production"
                ? "http://greyjcr.com/api"
                : "http://localhost:3000/api"),
      })
    ]
};