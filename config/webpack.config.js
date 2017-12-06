const path = require('path')
const mainCss = ['file-loader?name=css/app.css', 'extract-loader','css-loader', 'sass-loader', path.join(__dirname, '..', 'src', 'scss', 'main.scss')];
const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
  entry: ['./src/main.js', mainCss.join('!'), mainPo.join('!')],

  output: {
    path: path.join(__dirname, '..', 'public'),
    filename: 'javascript/bundle.js'
  },

  plugins: [
    new ExtractTextPlugin("/css/app.css"),
  ],

  module: {
    loaders: [{
      test: /\.po$/,
      loaders: 'json-loader!po-loader'
    }, {
      test: /\.yaml$/,
      include: path.resolve('config'),
      loaders: 'json-loader!yaml-loader'
    }, {
      test: /\.js$/,
      use: [
        'babel-loader'
      ],
      exclude: [
        /\/node_modules/
      ]
    }, {
      test: /\.(jpe?g|png|gif|svg)$/,
      loader: 'file-loader',
      options: {
        publicPath: '/',
        name: '[name].[ext]',
        outputPath: 'images/'
      }
    }
    ]
  },
  devtool: 'source-map'
}