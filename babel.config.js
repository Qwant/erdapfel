module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['Chrome >= 60', 'Firefox >= 44', 'Safari >= 10', 'Edge >= 17'],
        },
        useBuiltIns: 'entry',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ];

  const env = {
    test: {
      plugins: ['@babel/plugin-transform-runtime'],
    },
  };

  const plugins = ['@babel/plugin-syntax-dynamic-import'];

  return {
    presets,
    env,
    plugins,
    ignore: [/node_modules\/(?!@qwant\/)/],
  };
};
