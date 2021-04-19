const isProd = require('isprod');
const webpack = require('webpack');
module.exports = {
  entry: {
    feedback: "./src/feedback.ts",
    download: "./src/download.ts",
  },

  target: 'webworker',
  mode: isProd ? 'production' : 'development',
  // devtool: 'source-map',
  // devtool: 'inline-source-map',
  devtool: false,
  resolve: {
    extensions: ['.ts', '.js'],
    mainFields: ['main', 'module', 'browser'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    })
  ],
  stats:{
    warningsFilter: [
      /size limit/,
      /limit the size/
    ]
  },
  optimization: {
    usedExports: true,
  },
};
