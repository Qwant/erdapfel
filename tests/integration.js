module.exports = {
  testMatch : [`${__dirname}/integration/tests/*.js`],
  globalSetup : `${__dirname}/integration/server_start.js`,
  globalTeardown : `${__dirname}/integration/server_close.js`,
  testPathIgnorePatterns : ['/node_modules/'],
  'rootDir': __dirname + '/../',
  'verbose': true,
  'collectCoverage': false,
  'moduleFileExtensions': ['js', 'yml'],
  'transform': {
    '\\.yml$': 'yaml-jest',
    '\\.js?$': 'babel-jest'
  }
}
