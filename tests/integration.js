const config = require('./integration/test_config');
const { getIgnorePatterns } = require('./integration/device');
const commons = require('./commons');

module.exports = {
  ...commons,
  setupFilesAfterEnv: ['jest-extended'],
  testMatch: [`${__dirname}/integration/tests/autocomplete*.js`],
  globalSetup: `${__dirname}/integration/server_start.js`,
  globalTeardown: `${__dirname}/integration/server_close.js`,
  testPathIgnorePatterns: ['/node_modules/'].concat(getIgnorePatterns(process.env.TEST_DEVICE)),
  globals: {
    puppeteerArguments: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    APP_URL: 'http://localhost:3000/maps',
    __config: config,
  },
};
