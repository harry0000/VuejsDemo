const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './app/scripts/main.ts',
  output: {
    path: `${__dirname}/app/scripts/`,
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader'
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts'
    ],
    alias: {
      store: 'store/dist/store.modern.min.js',
      vue: 'vue/dist/vue.min.js'
    }
  },
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};
