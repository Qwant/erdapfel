module.exports = {

  testMatch : [__dirname+'/integration/tests/*.js'],
  testEnvironment : __dirname +'/integration/remote_test_environment.js',
  testPathIgnorePatterns : ['/node_modules/'],
  'rootDir': __dirname + '/../',
  'verbose': true,
  'collectCoverage': false,
  "moduleFileExtensions": ["js", "yml"],
  "transform": {
    "\\.yml$": "yaml-jest",
    "\\.js?$": "babel-jest"
  }
};
