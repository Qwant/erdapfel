const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const testMode = process.env.ENV && process.env.ENV === 'test'

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
    path: path.join(__dirname, '..', 'public', 'build', 'javascript'),
    filename: 'map.js'
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/mapbox-gl--ENV/, function(resource) {
      console.log(process.argv)
      if(process.argv.test) {
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
          loader : 'map-style-loader',
          options : {
            output: 'debug', // 'production' | 'omt'
            conf: `${__dirname}/map_local.json`, /* TODO find a way to serve corresponding map style */
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

let poSources = fs.readdirSync(path.join(__dirname, '..', 'language', 'message'))
  .filter((poSource) => {
    return poSource.indexOf('.po') !== -1
  })
  .map((poSource) => {
    return poSource.replace('.po', '')
  })

webpackChunks = webpackChunks.concat(poSources.map((poSource)=> {
  return {
    entry:  path.join(__dirname, '..', 'language', 'message', poSource + '.po'),
    module : {
      loaders : [{
        loader : 'file-loader',
        options : {
          name : 'public/build/javascript/message/[name].js'
        }
      }, {
        loader :'merge-i18n-source-loader',
        options : {
          sources : [
            {path : `${__dirname}/../language/date/date-${poSource.toLocaleLowerCase()}.json`, name : 'i18nDate'}
          ]
        }
      }, {
        test : /\.po$/,
        loader : 'po-js-loader',
      }],
    },
    output : {
      path : path.join(__dirname, '..'),
      filename : 'tmp/message.js'
    },
  }
}))

module.exports = webpackChunks


