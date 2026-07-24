const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = async () => {
    const { WebpackManifestPlugin } = await import("webpack-manifest-plugin");

    return {
        mode: "production",

        devtool: "source-map",

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
                    type: "asset/source"
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.scss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "fonts/[name].[contenthash][ext]"
                    }
                },
                {
                    test: /\.(png|jpe?g|gif|svg|webp)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "images/[name].[contenthash][ext]"
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
                fileName: "manifest.json",
                publicPath: "/"
            })
        ],

        optimization: {
            minimize: true,
            minimizer: [
                "...",
                new CssMinimizerPlugin()
            ]
        }
    };
};
