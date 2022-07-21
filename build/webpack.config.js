const path = require('path');
const yaml = require('node-yaml');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const compilationHash = require('../public/compilationHash');

const getBuildMode = function (argv) {
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
    entry: [
      path.join(__dirname, '..', 'src', 'scss', 'app.scss'),
      path.join(__dirname, '..', 'src', 'scss', 'unsupported.scss'),
    ],
    output: {
      path: path.join(__dirname, '..'),
      filename: 'tmp/[name].js',
    },
    module: {
      rules: [
        {
          use: {
            loader: 'file-loader',
            options: {
              name: `public/build/css/[name]-${compilationHash}.css`,
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'postcss-loader',
              options: {
                plugins: [require('autoprefixer')(), require('postcss-import')()],
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/,
          loader: 'file-loader',
          options: {
            publicPath: '/',
            name: '[name].[ext]',
            outputPath: 'images/',
          },
        },
        {
          test: /\.scss$/,
          loader: 'sass-loader',
        },
      ],
    },
  };
};

const mainJsChunkConfig = buildMode => {
  return {
    entry: [path.join(__dirname, '..', 'src', 'main.js')],
    output: {
      path: path.join(__dirname, '..', 'public', 'build', 'javascript'),
      filename: `bundle-${compilationHash}.js`,
      chunkFilename: '[name]-[chunkhash].bundle.js',
      publicPath: './statics/build/javascript/',
    },
    resolve: {
      alias: {
        config: path.resolve(__dirname, '../config/'),
        src: path.resolve(__dirname, '../src/'),
        appTypes: path.resolve(__dirname, '../@types/'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/'mapbox-gl'/, function (resource) {
        if (buildMode === 'test') {
          resource.request = resource.request.replace('mapbox-gl-js-mock');
        }
      }),
    ],
    optimization: {
      minimize: buildMode === 'production',
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // make sure the `_` and `_n` translation functions keep their name in the minimized bundle
            // as they are used by gettext to extract translation keys
            mangle: { reserved: ['_', '_n'] },
          },
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.yml$/,
          use: [
            { loader: 'babel-loader' },
            { loader: '@qwant/config-sanitizer-loader' },
            { loader: 'json-loader' },
            { loader: 'yaml-loader' },
          ],
        },
        {
          test: /style\.json$/,
          use: [
            {
              loader: '@qwant/map-style-loader',
              options: {
                output: 'production', // 'debug' | 'production' | 'omt'
                outPath: __dirname + '/../public/mapstyle',
                i18n: true,
                pins: true,
                icons: true,
                pixelRatios: [1, 2],
              },
            },
          ],
        },
        {
          test: /\.(js|jsx)$/,
          use: [{ loader: 'babel-loader' }],
        },
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.join(__dirname, '..', 'tsconfig.json'),
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2)$/,
          include: [path.resolve(__dirname, '../node_modules/@qwant/qwant-ponents/src')],
          use: ['file-loader'],
        },
        {
          test: /\.(css|scss)$/,
          include: [path.resolve(__dirname, '../node_modules/@qwant/qwant-ponents/src')],
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: buildMode !== 'production',
                importLoaders: 1,
                modules: {
                  auto: true,
                  exportOnlyLocals: false,
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: buildMode !== 'production',
                plugins: [require('autoprefixer')(), require('postcss-import')()],
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: {
                    removeViewBox: false,
                  },
                },
              },
            },
            'url-loader',
          ],
        },
      ],
    },
    devtool: buildMode === 'production' ? false : 'source-map',
    node: {
      fs: 'empty',
    },
  };
};

const copyPluginConfig = () => {
  return {
    entry: [path.join('@mapbox', 'mapbox-gl-rtl-text', 'mapbox-gl-rtl-text.min.js')],
    output: {
      path: path.join(__dirname, '..'),
      filename: 'tmp/mapbox-gl-rtl-text.min.js',
    },
    module: {
      rules: [
        {
          use: {
            loader: 'file-loader',
            options: {
              name: `./public/build/javascript/map_plugins/mapbox-gl-rtl-text-${compilationHash}.js`,
            },
          },
        },
      ],
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
  const availableLangs = constants.languages.supportedLanguages.filter(l => !l.deprecated);
  const deprecatedLangs = constants.languages.supportedLanguages.filter(l => l.deprecated);

  webpackChunks = webpackChunks
    .concat(
      availableLangs.map(language => {
        return {
          entry: path.join(__dirname, '..', 'language', 'message', language.code + '.po'),
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
                },
              },
            ],
          },
          output: {
            path: path.join(__dirname, '..'),
            filename: `./public/build/javascript/message/${language.locale}-${compilationHash}.js`,
          },
        };
      })
    )
    .concat(
      deprecatedLangs.map(language => {
        return {
          entry: path.join(__dirname, '..', 'language', 'message', language.fallback + '.po'),
          module: {
            rules: [
              {
                loader: '@qwant/po-js-loader',
              },
            ],
          },
          output: {
            path: path.join(__dirname, '..'),
            filename: `./public/build/javascript/message/${language.locale}-${compilationHash}.js`,
          },
        };
      })
    );
  return webpackChunks;
};

module.exports = (env, argv) => {
  /* eslint no-console: 0 */
  const buildMode = getBuildMode(argv);
  return webpackChunks(buildMode);
};
