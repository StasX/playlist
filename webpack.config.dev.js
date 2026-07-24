const path = require("path");
const webpack = require("webpack");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",

    entry: "./resources/js/main.js",

    output: {
        path: path.resolve(__dirname, "public"),
        publicPath: "/",
        filename: "js/[name].[contenthash:8].js",
        chunkFilename: "js/[name].[contenthash:8].chunk.js",
        clean: {
            keep: /^(index\.php|favicon\.ico|robots\.txt)$/
        },
        assetModuleFilename: "assets/[name].[contenthash:8][ext]"
    },

    module: {
        rules: [
            {
                test: /\.html$/i,
                type: "asset/source",
            },
            {
                test: /\.s?css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)$/i,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name][ext]"
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                type: "asset/resource",
                generator: {
                    filename: "images/[name][ext]"
                }
            }
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:8].css",
            chunkFilename: "css/[name].[contenthash:8].chunk.css"
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new WebpackManifestPlugin({
            fileName: "manifest.json"
        })
    ],

    devtool: "source-map"
};
