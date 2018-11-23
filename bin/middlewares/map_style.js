const styleBuilder = require('@qwant/map-style-builder')
const styleConfigure = require('mapbox_style_configure')

module.exports = function (config) {


  const style = ""


  return function (res, req) {
    let lang = req.params.lang
    styleConfigure(style, config.mapStyle, lang)
  }

}