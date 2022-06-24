const path = require('path');
const compilationHash = require('../public/compilationHash');

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  staticDirs: ['../public'],
  framework: "@storybook/react",
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      config: path.resolve(__dirname, '../config/'),
      src: path.resolve(__dirname, '../src/'),
      appTypes: path.resolve(__dirname, '../@types/'),
    };

    // SVG
    config.module.rules.unshift({
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
      ]
    })

    // TS/TSX
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            configFile: path.join(__dirname, '..', 'tsconfig.json'),
          },
        },
      ],
    })    
    
    // JS/JSX
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      use: [{ loader: 'babel-loader' }],
    })
    
    // CSS/SCSS
    config.module.rules.push({
      test: /\.(css|scss)$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
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
            sourceMap: true,
            plugins: [require('autoprefixer')(), require('postcss-import')()],
          },
        },
        'sass-loader',
      ],
    })
  
    return config;
  },
  env: (config) => ({
    ...config,
    COMPILATION_HASH: compilationHash,
  }),
}