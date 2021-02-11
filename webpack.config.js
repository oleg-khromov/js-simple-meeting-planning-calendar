const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const pages = [
  {
    name: "index",
    title: "Calendar",
  },
  {
    name: "create-event",
    title: "Create new event",
  }
];

const dir = {
  src: path.resolve(__dirname, './src'),
  build: path.resolve(__dirname, './dist'),
}

const config = {
  entry: {
    main: dir.src + "/index.js",
  },
  output: {
    path: dir.build,
    filename: "./assets/js/main.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // use: ["babel-loader"],
      },
      {
        test: /\.(scss|css)$/,
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
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./assets/css/main.css",
    }),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    contentBase: dir.build,
    open: true,
    compress: true,
    hot: true,
    port: 3000,
  },
  resolve: { extensions: [".js"] }
};

pages.forEach(({ name, title }) => {
  config.plugins.push(
    new HtmlWebpackPlugin({
      title: `${title}`,
      filename: `${name}.html`,
      template: dir.src + `/${name}.html`,
      inject: 'body'
    }));
})

if (!config.mode) {
  config.mode = "development";
}

if (config.mode === "production") {
  config.optimization = {
    minimize: true,
    minimizer: [new OptimizeCssAssetsPlugin(), new TerserPlugin()],
  }
}

module.exports = config;