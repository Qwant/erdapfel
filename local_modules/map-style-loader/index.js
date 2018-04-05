const utils = require('loader-utils')
const yaml = require('node-yaml')

const styleBuilder = require('@qwant/map-style-builder')
const languageFallbacks = yaml.readSync('../../node_modules/@qwant/qwant-basic-gl-style/i18n.yml').languageFallbacks

module.exports = function(source) {
  if(this.cacheable) {
    this.cacheable()
  }

  const style = JSON.parse(source)

  let options = utils.getOptions(this)
  options = options || {}
  options.styleDir = this.context
  options.output = options.output || 'debug'
  options.conf = require(options.conf)

  /* apply i18n label logic */
  const builtStyle = JSON.parse(styleBuilder(style, options))

  builtStyle.layers = builtStyle.layers.map((layer) => {
    if(layer['layout'] && layer['layout']['text-field']) {
      let fallback = languageFallbacks.find((languageFallback) => {
        return languageFallback.id === layer.id
      })

      if(fallback) {
        layer['layout']['text-field'] = fallback.lang
      }
    }
    return layer
  })

  return JSON.stringify(builtStyle)
}
