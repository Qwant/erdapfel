const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const yaml = require('node-yaml')
const languages = yaml.readSync('./language.yml')


const sassChunkConfig = {
    entry : path.join(__dirname, '..', 'src', 'scss', 'main.scss'),
    output: {
      path: path.join(__dirname, '..'),
      filename: 'tmp/css.js'
    },
    module : {
      loaders : [{
        loader : 'file-loader',
        options: {
          name : 'public/css/app.css'
        }
      }, {
        test : /\.scss$/,
        loader : 'postcss-loader',
        options : {
          plugins: [
            require('autoprefixer')({})
          ]

        }
      }, {
        test : /\.scss$/,
        loader : 'sass-loader'
      }],
    },
  }

const mainJsChunkConfig = {
  entry: './src/main.js',

  output: {
    path: path.join(__dirname, '..', 'public'),
    filename: 'javascript/bundle.js'
  },

  module: {
    loaders: [{
      test: /\.yaml$/,
      include: path.resolve('config'),
      loaders: 'json-loader!yaml-loader'
    }, {
      test: /\.js$/,
      use:'babel-loader',
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

webpackChunks = [sassChunkConfig, mainJsChunkConfig]

webpackChunks = webpackChunks.concat(languages.map((language)=> {
  return {
    entry:  path.join(__dirname, '..', 'language', 'message', language + '.po'),
    module : {
      loaders : [{
        loader : 'file-loader',
        options : {
          name : 'public/message/[name].js'
        }
      }, {
        test : /\.po$/,
        loader : 'po-js-loader',
      }],
    },
    output : {
      path : path.join(__dirname, '..'),
      filename : 'tmp/message.js'
    }
  }
}))

module.exports = webpackChunks
