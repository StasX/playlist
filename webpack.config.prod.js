// webpack.config.js
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const config = {
    mode: "production",

    entry: "./resources/js/main.js",

    output: {
        path: path.resolve(__dirname, "public"),
        filename: "js/bundle.[contenthash].js",
        clean: false,
        assetModuleFilename: "[name].[contenthash][ext]"
    },

    module: {
        rules: [
            {
                test: /\.html$/i,
                type: "asset/source",
            },
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
            filename: "css/bundle.[contenthash].css"
        }),

        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],

    optimization: {
    minimizer: [
        "...",
        new CssMinimizerPlugin()
    ],
    splitChunks: {
        chunks: "all"
    }
}
};

module.exports = (async () => {
    const { WebpackManifestPlugin } = await import("webpack-manifest-plugin");
    config.plugins.push(new WebpackManifestPlugin({ fileName: "manifest.json" }));
    return config;
})();
