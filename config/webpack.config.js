const path = require('path')
const yaml = require('node-yaml')

const ENVIRONMENTS = ['local', 'development', 'production']
const env = process.env.ENV || 'local'
let environment = ''
if(ENVIRONMENTS.includes(env)) {
  environment = env
} else {
  throw `Typo in your environment : ${env}. environment must be ${ENVIRONMENTS.join(', ')}`
}

console.log('*--------------------*')
console.log(`Building on ${environment} mode`)
console.log('*--------------------*')

const languages = yaml.readSync('./language.yml')[environment]

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
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/',
          name: '[name].[ext]',
          outputPath: 'images/'
        }
      }, {
        test : /\.scss$/,
        loader : 'sass-loader'
      }],
    },
  }

const mainJsChunkConfig = {
  entry: ['./src/main.js'],
  output: {
    path: path.join(__dirname, '..', 'public'),
    filename: 'javascript/bundle.js'
  },

  module: {
    loaders: [{
      test : /style\.json$/,
      use : [
        {
          loader : 'map-style-loader',
          options : {
            output: 'debug', // 'production' | 'omt'
            conf: `${__dirname}/map_${environment}.json`,
            outPath : __dirname + '/../public',
            pixelRatios : [1,2]
          }
        }
      ],
    }, {
      test: /\.dot/,
      use: [
        {loader : 'dot-loader'}
      ]
    }, {
      test: /\.yml$/,
      use: [
        {loader : 'webpack-config-loader', options : {environment : environment}},
        {loader : 'config-sanitizer-loader'},
        {loader : 'json-loader'},
        {loader : 'yaml-loader'}
      ]
    }, {
      test: /\.js$/,
      exclude: [
        /\/node_modules/
      ]
    }]
  },
  devtool: 'source-map'
}


const mapJsChunkConfig = {
  entry: ['./src/map.js'],

  output: {
    path: path.join(__dirname, '..', 'public'),
    filename: 'javascript/map.js'
  },

  module: {
    loaders: [{
      test : /style\.json$/,
      use : [
        {
          loader : 'json-loader'
        },
        {
          loader : 'map-style-loader',
          options : {
            output: 'debug', // 'production' | 'omt'
            conf: `${__dirname}/map_${environment}.json`,
            outPath : __dirname + '/../public',
            i18n : true,
            pixelRatios : [1,2]
          }
        }
      ],
    }, {
      test: /\.js$/,
      exclude: [
        /\/node_modules/
      ]
    }]
  },
  devtool: 'source-map'
}

webpackChunks = [sassChunkConfig, mainJsChunkConfig, mapJsChunkConfig]

webpackChunks = webpackChunks.concat(languages.supportedLanguages.map((language)=> {
  return {
    entry:  path.join(__dirname, '..', 'language', 'message', language.locale + '.po'),
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


