// tslint:disable-next-line:no-var-requires
require("dotenv").config();

const webpack = require("webpack");
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin');
const projectConfig = require("../webpack.config");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (storybookConfig, configType) => {
    storybookConfig.mode = projectConfig.mode;
    storybookConfig.resolve.alias = Object.assign(storybookConfig.resolve.alias, projectConfig.resolve.alias);
    storybookConfig.module.rules = storybookConfig.module.rules.concat(projectConfig.module.rules);
    storybookConfig.resolve.extensions = storybookConfig.resolve.extensions.concat(projectConfig.resolve.extensions);
    storybookConfig.plugins.push(new MiniCssExtractPlugin(), new TSDocgenPlugin(), new webpack.DefinePlugin({
        GREY_API_URL: JSON.stringify("http://localhost:3000/api"),
        PAYPAL_MODE: JSON.stringify(process.env.PAYPAL_MODE),
    }));
    
    return storybookConfig;
};