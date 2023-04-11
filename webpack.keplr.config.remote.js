const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve("stream-browserify"),
      path: require.resolve("path-browserify")
    },
  },
  mode: "production",
  entry: {
    main: "./src/withKeplrClient.js",
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist/"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(path.resolve(__dirname, '.'), 'index.html'),
      filename: 'index.html',
    }),
  ],
};
