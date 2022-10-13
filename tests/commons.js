module.exports = {
  rootDir: __dirname + '/../',
  moduleNameMapper: {
    '^src(.*)$': '<rootDir>/src$1',
    '^config(.*)$': '<rootDir>/config$1',
  },
  transform: {
    '\\.yml$': 'yaml-jest',
    '\\.js?$': 'babel-jest',
    '\\.ts?$': 'ts-jest',
  },
  collectCoverage: false,
  verbose: true,
};
