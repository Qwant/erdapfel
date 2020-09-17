/* globals require */

require('@babel/register');
require('@babel/polyfill');

require('dotenv').config();
const configBuilt = require('@qwant/nconf-builder');
const App = require('./app');
const config = configBuilt.get();

if (config) {
  const PORT = config.PORT;
  const appServer = new App(config);
  appServer.start(PORT);
}
