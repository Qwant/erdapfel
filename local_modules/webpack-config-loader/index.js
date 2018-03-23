const utils  = require("loader-utils");
const vm = require('vm');

module.exports = function(content) {
  let options = utils.getOptions(this)
  let environment;
  try {
    environment = options.environment || 'development';
  }
  catch (e) {
    environment = 'development';
    console.error('Missing loader.configEnvironment key from webpack config. Assuming "development".');
  }

  /*
    Run code in a special context
   */
  let sandbox = { module: {} };
  vm.runInNewContext(content, sandbox, this.resourcePath);

  /*
    Grab the appropriate configuration based on environment
   */
  let allConfigs = sandbox.module.exports
  let envConfig = allConfigs[environment];

  return  `module.exports = ${JSON.stringify(envConfig)};`
};