const path = require("path");
const webpack = require("webpack");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",

    entry: "./resources/js/main.js",

    output: {
        path: path.resolve(__dirname, "public"),
        filename: "js/main.js",
        clean: false,
        assetModuleFilename: "assets/[name][ext]"
    },

    module: {
        rules: [
            {
                test: /\.scss$/i,
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
            }
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/main.css"
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
