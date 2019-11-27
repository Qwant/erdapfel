module.exports = {
  testMatch: [__dirname + '/units/*.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  rootDir: __dirname + '/../',
  verbose: true,
  collectCoverage: false,
  globals: {
    __config: require('@qwant/nconf-builder').get_without_check(),
  },
  transform: {
    '\\.yml$': 'yaml-jest',
    '\\.js?$': 'babel-jest',
  },
};
