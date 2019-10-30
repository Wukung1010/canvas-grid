const path = require('path');
const HtmlWebpack = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'grid.bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new HtmlWebpack({
      template: path.resolve(__dirname, 'index.html')
    })
  ],
  devServer: {
    port: 80
  }
}