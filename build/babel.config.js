/* globals module */

module.exports = function(mode) {
  const plugins = [
    '@babel/plugin-syntax-dynamic-import',
  ];

  const production = {
    presets:
      [['@babel/preset-env', {
        'targets': {
          'browsers': [
            'Chrome >= 60',
            'Firefox >= 44',
            'Safari >= 7',
            'Explorer 11',
            'Edge >= 17',
          ],
        },
        'useBuiltIns': 'entry',
        'corejs': 2,
      }]],
  };

  const development = {
    presets: [
      [
        '@babel/preset-env',
        {
          'useBuiltIns': 'entry',
          'corejs': 2,
        },
      ],
    ],
  };

  const conf = mode === 'production' ? production : development;

  return {
    'presets': conf.presets.concat([ '@babel/preset-react' ]),
    'ignore': [
      'node_modules',
    ],
    plugins,
  };
};
