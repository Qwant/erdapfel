const yaml = require('node-yaml')

module.exports = function() {
  let configFolderfiles = fs.readDir('../config')
  let sources = configFolderfiles.filter((configFolderfile) => {
    return configFolderfile.match(/\.yml$/)
  })
  const configs = sources.map(async (source) => {
    return await {data : yaml.readFile(source), fileName : source}
  })
  const jsonConfigs = configs.map((config) => {
    return {json : JSON.stringify(config.data), filename : config.filename}
  })

  return `window.__config = {${jsonConfigs.map((jsonConfig) => {return `${jsonConfig.filename} : ${jsonConfig.json}` }).join('')}};`
}