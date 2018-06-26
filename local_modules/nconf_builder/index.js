const path = require('path')
const nconf = require('nconf')
const nconfYml = require('nconf-yaml')

const PREFIX = 'TILEVIEW_'

nconf
  .env({
    transform : (configObject) => {
      if(configObject.key.indexOf(PREFIX) === 0) {
        configObject.key = configObject.key.replace(PREFIX, '')
        return configObject
      }
    },
    separator : '_'
  })
  .file({file : path.resolve(`${__dirname}/../../config/default_config.yml`), format : nconfYml})
  .file({file : path.resolve(`${__dirname}/../../config/constants.yml`), format : nconfYml})


module.exports = (function() {
  return nconf
})()
