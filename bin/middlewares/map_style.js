const styleBuilder = require('@qwant/map-style-builder')
const styleConfigure = require('mapbox_style_configure')
const qwantStyle = require('@qwant/qwant-basic-gl-style/style.json')
const path = require('path')

module.exports = function (config) {

  let options = {
    output: 'production', // 'debug' | 'production' | 'omt'
    outPath : __dirname + '/../public/mapstyle',
    i18n : true,
    icons : true,
    pixelRatios : [1,2],
    styleDir : path.resolve(path.join(__dirname, '..', '..', 'node_modules', '@qwant' , 'qwant-basic-gl-style')),
    conf : {tileserver_base : '{tileserver_base}', tileserver_poi : '{tileserver_poi}', spriteserver : '{spriteserver}', fontserver : '{fontserver}'},
    ignoreSprite : true
  }

  let builtStyle = styleBuilder(qwantStyle, options)

  return function (req, res) {
    let lang = req.query.lang



    res.setHeader('Content-Type', 'application/json');
    res.send(styleConfigure(builtStyle, config.mapStyle, lang))
  }

}
