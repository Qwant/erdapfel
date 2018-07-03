const path = require('path')
const yaml = require('node-yaml')
const webpack = require('webpack')
const testMode = process.env.TEST === 'true'

console.log('*--------------------*')
console.log(`Building on ${testMode ? 'test' : 'normal'} mode`)
console.log('*--------------------*')

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
    path: path.join(__dirname, '..', 'public', 'build', 'javascript'),
    filename: 'bundle.js'
  },

  module: {
    loaders: [{
      test: /\.dot/,
      use: [
        {loader : 'dot-loader'}
      ]
    }, {
      test: /\.yml$/,
      exclude: [path.resolve(__dirname, '../node_modules/@qwant/')],
      use: [
        {loader : '@qwant/config-sanitizer-loader'},
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
    path: path.join(__dirname, '..', 'public', 'build', 'javascript'),
    filename: 'map.js'
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/mapbox-gl--ENV/, function(resource) {
      if(testMode) {
        resource.request = resource.request.replace('--ENV', '-js-mock')
      } else {
        resource.request = resource.request.replace('--ENV', '')
      }
    })
  ],
  module: {
    loaders: [{
      test: /\.yml$/,
      use: [
        {loader : 'json-loader'},
        {loader : 'yaml-loader'}
      ]
    }, {
      test : /style\.json$/,
      use : [
        {
          loader : 'json-loader'
        },
        {
          loader : '@qwant/map-style-loader',
          options : {
            output: 'debug', // 'production' | 'omt'
            outPath : __dirname + '/../public',
            i18n : true,
            icons : true,
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

const constants = yaml.readSync('./constants.yml')
webpackChunks = webpackChunks.concat(constants.languages.supportedLanguages.map((language)=> {
  return {
    entry:  path.join(__dirname, '..', 'language', 'message', language.locale + '.po'),
    module : {
      loaders : [
         {
          loader :'@qwant/merge-i18n-source-loader',
          options : {
            sources : [
              {path : `${__dirname}/../language/date/date-${language.locale.toLocaleLowerCase()}.json`, name : 'i18nDate'}
            ]
          }
        },
        {
          loader : '@qwant/po-js-loader',
        },
        {
          test : /\.po$/,
          loader: '@qwant/merge-po-loader',
          options: {
            fallbackList : language.fallback,
            messagePath : path.join(__dirname, '..', 'language', 'message'),
            locale: language.locale
          }
        }],
    },

    output : {
      path : path.join(__dirname, '..'),
      filename : `./public/build/javascript/message/${language.locale}.js`
    },
  }
}))

module.exports = webpackChunks
