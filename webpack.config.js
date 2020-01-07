const path = require('path');

const config = {
  entry: './index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'Grid',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  devtool: 'eval-source-map',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          'ts-loader',
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/, // 不排除掉会导致 babel.config.useBuiltIns: usage 发生错误
      },
    ],
  },
  devServer: {
    useLocalIp: true,
    host: '0.0.0.0', // 这个配置能解决跨域问题 能让外部访问
    port: 3000,
    contentBase: [path.join(__dirname, './example'), path.join(__dirname, './dist')],
  },
  stats: {
    all: false,
    colors: true,
    builtAt: true,
    errors: true,
    timings: true,
    version: true,
    assets: true,
  },
};

module.exports = config;
