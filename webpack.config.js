const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  resolve: {
    extensions: [".ts", ".ts"],
  },

  // loaders
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: [
          { loader: "ts-loader", options: { onlyCompileBundledFiles: true } },
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
