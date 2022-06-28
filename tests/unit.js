const commons = require('./commons');

module.exports = {
  ...commons,
  testMatch: [__dirname + '/units/*.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  globals: {
    __config: require('@qwant/nconf-builder').get_without_check(),
  },
};
