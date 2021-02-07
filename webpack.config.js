const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const minify = require("optimize-css-assets-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: path.resolve(__dirname, "./src/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./assets/js/main.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        //use: ["babel-loader"],
      },
      {
        test: /\.(s*)css$/,
        use: [
          MiniCssExtractPlugin.loader,
          //'style-loader',
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new minify({})],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Calendar",
      filename: "index.html",
      template: path.resolve(__dirname, "./src/index.html"),
    }),
    new HtmlWebpackPlugin({
      title: "Create new event",
      filename: "create-event.html",
      template: path.resolve(__dirname, "./src/create-event.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "./assets/css/main.css",
    }),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, "./dist"),
    open: true,
    compress: true,
    hot: true,
    port: 8080,
  },
  resolve: { extensions: [".js"] },
};
