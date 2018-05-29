module.exports = {

  testMatch : [__dirname+'/libs/*.js', __dirname+'/integration/*.js'],
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
