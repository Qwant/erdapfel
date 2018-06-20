module.exports = {
  testMatch : [__dirname+'/units/*.js'],
  testPathIgnorePatterns : ['/node_modules/'],
  rootDir: __dirname + '/../',
  verbose: true,
  collectCoverage: false,
  globals:{
      __config : {}
  },
  transform: {
    '\\.yml$': 'yaml-jest',
    '\\.js?$': 'babel-jest'
  }
};
