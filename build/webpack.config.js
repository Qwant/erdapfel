/* globals require, process, __dirname, module */

const path = require('path');
const yaml = require('node-yaml');
const webpack = require('webpack');
const babelConf = require('./babel.config');

const getBuildMode = function(argv) {
  const isTestMode = process.env.TEST === 'true';

  const argvMode = argv.mode;
  if (isTestMode) {
    return 'test';
  } else if (argvMode === 'development') {
    return 'development';
  }
  return 'production';
};


const sassChunkConfig = () => {
  return {
    entry: path.join(__dirname, '..', 'src', 'scss', 'main.scss'),
    output: {
      path: path.join(__dirname, '..'),
      filename: 'tmp/css.js',
    },
    module: {
      rules: [{
        use: {
          loader: 'file-loader',
          options: {
            name: 'public/css/app.css',
          },
        },
      }, {
        test: /\.scss$/,
        use: [{
          loader: 'postcss-loader',
          options: {
            plugins: [
              require('autoprefixer')(),
              require('postcss-import')(),
            ],
          },
        }],
      }, {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'file-loader',
        options: {
          publicPath: '/',
          name: '[name].[ext]',
          outputPath: 'images/',
        },
      }, {
        test: /\.scss$/,
        loader: 'sass-loader',
      }],
    },
  };
};


const mainJsChunkConfig = buildMode => {
  return {
    entry: [path.join(__dirname, '..', 'src', 'main.js')],
    output: {
      path: path.join(__dirname, '..', 'public', 'build', 'javascript'),
      filename: 'bundle.js',
      chunkFilename: '[name].bundle.js',
      publicPath: './statics/build/javascript/',
    },
    resolve: {
      alias: {
        config: path.resolve(__dirname, '../config/'),
        src: path.resolve(__dirname, '../src/'),
      },
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/mapbox-gl--ENV/, function(resource) {
        if (buildMode === 'test') {
          resource.request = resource.request.replace('--ENV', '-js-mock');
        } else {
          resource.request = resource.request.replace('--ENV', '');
        }
      }),
    ],
    module: {
      rules: [{
        test: /\.yml$/,
        use: [
          {
            loader: 'babel-loader',
            options: babelConf(buildMode),
          },
          { loader: '@qwant/config-sanitizer-loader' },
          { loader: 'json-loader' },
          { loader: 'yaml-loader' },
        ],
      }, {
        test: /style\.json$/,
        use: [
          {
            loader: '@qwant/map-style-loader',
            options: {
              output: 'production', // 'debug' | 'production' | 'omt'
              outPath: __dirname + '/../public/mapstyle',
              i18n: true,
              icons: true,
              pixelRatios: [1, 2],
            },
          },
        ],
      }, {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: babelConf(buildMode),
          },
        ],
        exclude: [
          /\/node_modules/,
        ],
      }],
    },
    devtool: 'source-map',
    node: {
      fs: 'empty',
    },
  };
};

const copyPluginConfig = () => {
  return {
    entry: [
      path.join('@mapbox', 'mapbox-gl-rtl-text', 'mapbox-gl-rtl-text.min.js'),
    ],
    output: {
      path: path.join(__dirname, '..'),
      filename: 'tmp/mapbox-gl-rtl-text.min.js',
    },
    module: {
      rules: [{
        use: {
          loader: 'file-loader',
          options: {
            name: './public/build/javascript/map_plugins/mapbox-gl-rtl-text.js',
          },
        },
      }],
    },
  };
};

const webpackChunks = buildMode => {
  let webpackChunks = [
    mainJsChunkConfig(buildMode),
    copyPluginConfig(),
    sassChunkConfig(buildMode),
  ];
  const constants = yaml.readSync('../config/constants.yml');

  webpackChunks = webpackChunks.concat(constants.languages.supportedLanguages.map(language => {
    return {
      entry: path.join(__dirname, '..', 'language', 'message', language.locale + '.po'),
      module: {
        rules: [
          {
            loader: '@qwant/po-js-loader',
          },
          {
            test: /\.po$/,
            loader: '@qwant/merge-po-loader',
            options: {
              fallbackList: language.fallback,
              messagePath: path.join(__dirname, '..', 'language', 'message'),
              locale: language.locale,
            },
          }],
      },
      output: {
        path: path.join(__dirname, '..'),
        filename: `./public/build/javascript/message/${language.locale}.js`,
      },
    };
  }));
  return webpackChunks;
};

module.exports = (env, argv) => {
  /* eslint no-console: 0 */
  const buildMode = getBuildMode(argv);
  return webpackChunks(buildMode);
};
