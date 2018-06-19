const path = require('path')
const nconf = require('nconf')
const nconfYml = require('nconf-yaml')

const PREFIX = 'TILEVIEW_'

nconf
  .file({file : path.resolve(`${__dirname}/../../config/default_config.yml`), format : nconfYml})
  .env({
    transform : (configObject) => {
      if(configObject.key.indexOf(PREFIX) === 0) {
        configObject.key = configObject.key.replace(PREFIX, '')
        return configObject
      }
    }
  })

module.exports = (function() {
  return nconf
})()
