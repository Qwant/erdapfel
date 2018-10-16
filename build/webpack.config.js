const path = require('path')
const yaml = require('node-yaml')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const getBuildMode = function(argv){
  const isTestMode = process.env.TEST === 'true'

  let argvMode = argv.mode
  if(isTestMode) {
    return 'test'
  }
  if(argvMode === 'production') {
    return 'production'
  }
  return 'development'
}


const addJsOptimizePlugins = function(buildMode, plugins){
  if (buildMode === 'production'){
    plugins = plugins.concat([
      new UglifyJsPlugin({
        uglifyOptions: {
          beautify: false,
          ecma: 5,
          compress: true,
          comments: false
        }
      })
    ])
  }
  return plugins
}

const sassChunkConfig = () => {
  return {
    entry : path.join(__dirname, '..', 'src', 'scss', 'main.scss'),
    output: {
      path: path.join(__dirname, '..'),
      filename: 'tmp/css.js'
    },
    module : {
      rules : [{
        use : {
          loader : 'file-loader',
          options: {
            name : 'public/css/app.css'
          }
        }
      }, {
        test : /\.scss$/,
        use: [{
          loader : 'postcss-loader',
          options : {
            plugins: [
              require('autoprefixer')(),
              require('postcss-import')()
            ]
          }
        }],
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
}


const mainJsChunkConfig  = (buildMode) => {
  return {
    entry: ['./src/main.js'],
    output: {
      path: path.join(__dirname, '..', 'public', 'build', 'javascript'),
      filename: 'bundle.js'
    },
    plugins: addJsOptimizePlugins(buildMode, []),
    module: {
      rules: [{
        test: /\.dot/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {loader: 'dot-loader'}
        ]
      }, {
        test: /\.yml$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {loader: '@qwant/config-sanitizer-loader'},
          {loader: 'json-loader'},
          {loader: 'yaml-loader'}
        ]
      }, {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
          ],
        exclude: [
          /\/node_modules/
        ]
      }]
    },
    devtool: 'source-map'
  }
}

const mapJsChunkConfig = (buildMode) => {
  return {
    entry: ['./src/map.js'],

      output: {
    path: path.join(__dirname, '..', 'public', 'build', 'javascript'),
      filename: 'map.js'
  },
    plugins: addJsOptimizePlugins(buildMode, [
      new webpack.NormalModuleReplacementPlugin(/mapbox-gl--ENV/, function(resource) {
        if(buildMode === 'test') {
          resource.request = resource.request.replace('--ENV', '-js-mock')
        } else {
          resource.request = resource.request.replace('--ENV', '')
        }
      })
    ]),
      module: {
    rules: [
      {
        test: /\.dot/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {loader : 'dot-loader'}
        ]
      }, {
        test: /\.yml$/,
        use: [
          {loader : '@qwant/config-sanitizer-loader'},
          {loader : 'json-loader'},
          {loader : 'yaml-loader'}
        ]
      }, {
        test : /style\.json$/,
        use : [
          {
            loader : '@qwant/map-style-loader',
            options : {
              output: 'production', // 'debug' | 'production' | 'omt'
              outPath : __dirname + '/../public/mapstyle',
              i18n : true,
              icons : true,
              pixelRatios : [1,2]
            }
          }
        ],
      }, {
        test: /\.js$/,
        use : [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }

        ],
        exclude: [
          /\/node_modules/
        ]
      }]
  },
    devtool: 'source-map'
  }
}

webpackChunks = (buildMode) => {
  let webpackChunks = [sassChunkConfig(buildMode), mainJsChunkConfig(buildMode), mapJsChunkConfig(buildMode)]
  const constants = yaml.readSync('../config/constants.yml')

  webpackChunks = webpackChunks.concat(constants.languages.supportedLanguages.map((language) => {
    return {
      entry: path.join(__dirname, '..', 'language', 'message', language.locale + '.po'),
      module: {
        rules: [
          {
            loader: '@qwant/merge-i18n-source-loader',
            options: {
              sources: [
                {
                  path: `${__dirname}/../language/date/date-${language.locale.toLocaleLowerCase()}.json`,
                  name: 'i18nDate'
                }
              ]
            }
          },
          {
            loader: '@qwant/po-js-loader',
          },
          {
            test: /\.po$/,
            loader: '@qwant/merge-po-loader',
            options: {
              fallbackList: language.fallback,
              messagePath: path.join(__dirname, '..', 'language', 'message'),
              locale: language.locale
            }
          }],
      },
      output: {
        path: path.join(__dirname, '..'),
        filename: `./public/build/javascript/message/${language.locale}.js`
      },
    }
  }))
  return webpackChunks
}

module.exports = (env, argv) => {
  let buildMode = getBuildMode(argv)

  console.log('*--------------------*')
  console.log(`Building on ${buildMode} mode`)
  console.log('*--------------------*')

  return webpackChunks(buildMode)
}
