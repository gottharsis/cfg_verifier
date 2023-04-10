const path = require("path")

const isProduction = process.env.NODE_ENV === "production"
const HtmlWebpackPlugin = require("html-webpack-plugin")
// const isProduction = false

module.exports = {
    mode: isProduction ? "production" : "development",
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: [
                    {
                        loader: "ts-loader",
                        options: { onlyCompileBundledFiles: true },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    devtool: isProduction ? false : "source-map",
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
    ],
}
