const config = require('./integration/test_config');
const { getIgnorePatterns } = require('./integration/device');

module.exports = {
  setupFilesAfterEnv: ['jest-extended'],
  testMatch: [`${__dirname}/integration/tests/*.js`],
  globalSetup: `${__dirname}/integration/server_start.js`,
  globalTeardown: `${__dirname}/integration/server_close.js`,
  testPathIgnorePatterns: ['/node_modules/'].concat(getIgnorePatterns(process.env.TEST_DEVICE)),
  rootDir: __dirname + '/../',
  verbose: true,
  collectCoverage: false,
  transform: {
    '\\.yml$': 'yaml-jest',
    '\\.js?$': 'babel-jest',
    '\\.ts?$': 'ts-jest',
  },
  globals: {
    puppeteerArguments: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    APP_URL: 'http://localhost:3000/maps',
    __config: config,
  },
  moduleNameMapper: {
    '^src(.*)$': '<rootDir>/src$1',
    '^config(.*)$': '<rootDir>/config$1',
  },
};
