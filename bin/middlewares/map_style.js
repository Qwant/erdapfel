const styleBuilder = require('@qwant/map-style-builder')
const styleConfigure = require('mapbox_style_configure')
const qwantStyle = require('@qwant/qwant-basic-gl-style/style.json')
const path = require('path')


module.exports = function (config, languages) {

  /* pre-build style on server start */
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
    /* get lang routine */
    let langParameter = req.query.lang
    let matchedLanguage = languages.defaultLanguage
    if(langParameter) {
      matchedLanguage = languages.supportedLanguages.find((supportedLanguage) => supportedLanguage.code === langParameter)
      if(!matchedLanguage) {
        res.status(400)
        res.send({error : `Unsupported language code : ${langParameter}`})
        return
      }
    } else {
      matchedLanguage = languages.defaultLanguage
    }

    /* config rewriting */
    let host = req.get('host')
    let urls = {
      spritesUrl : `https://${host}${config.mapStyle.spritesUrl}` ,
      fontsUrl : `https://${host}${config.mapStyle.fontsUrl}`
    }
    let mapStyle = Object.assign({}, config.mapStyle, urls)

    /* json render */
    res.setHeader('Content-Type', 'application/json')
    res.send(styleConfigure(builtStyle, mapStyle, matchedLanguage.code))
  }
}
