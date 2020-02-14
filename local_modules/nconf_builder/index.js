const path = require('path');
const nconf = require('nconf');
const nconfYml = require('nconf-yaml');

const PREFIX = 'TILEVIEW_';

nconf
  .env({
    transform: configObject => {
      if (configObject.value === 'false') {
        configObject.value = false;
      }
      if (configObject.value === 'true') {
        configObject.value = true;
      }
      if (configObject.key.indexOf(PREFIX) === 0) {
        configObject.key = configObject.key.replace(PREFIX, '');
        return configObject;
      }
    },
    separator: '_',
  })
  .file({ file: path.resolve(`${__dirname}/../../config/default_config.yml`), format: nconfYml });

function check_is_json_var(toCheck, name) {
  try {
    JSON.parse(toCheck);
  } catch (error) {
    console.error(`Error: \`${name}\` environment variable should be valid JSON!`);
    console.error(`JSON error: "${error.message}"`);
    return 1;
  }
  return 0;
}

class ConfigChecker {
  constructor(conf) {
    this.conf = conf;
  }

  check(confToCheck) {
    let errors = 0;

    errors += check_is_json_var(confToCheck.mapStyle.poiMapUrl, 'TILEVIEW_mapStyle_poiMapUrl');
    errors += check_is_json_var(confToCheck.mapStyle.baseMapUrl, 'TILEVIEW_mapStyle_baseMapUrl');
    return errors;
  }

  get() {
    const confToCheck = this.get_without_check();
    if (this.check(confToCheck) !== 0) {
      return null;
    }
    return confToCheck;
  }

  set(key, value) {
    this.conf.set(key, value);
  }

  get_without_check() {
    return this.conf.get();
  }
}

module.exports = (function() {
  return new ConfigChecker(nconf);
})();
