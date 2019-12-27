const path = require('path');

module.exports = {
  entry: './index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          'ts-loader',
          'babel-loader',
        ],
      },
    ],
  },
};
