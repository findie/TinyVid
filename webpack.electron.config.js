const path = require('path');
// const webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  entry: './electron/main.ts',
  target: 'electron-main',
  module: {
    rules: [
      // {
      //   test: /\.(js|ts|tsx)$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //   },
      // },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts|tsx)$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  optimization: {
    minimize: false
  },
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     _: 'lodash',
  //   }),
  // ],
};
