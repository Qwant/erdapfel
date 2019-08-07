/* globals require, module, __dirname */

const styleBuilder = require('@qwant/map-style-builder');
const styleConfigure = require('@qwant/mapbox_style_configure');
const qwantStyle = require('@qwant/qwant-basic-gl-style/style.json');
const path = require('path');
const Uri = require('@qwant/uri');


module.exports = function(config, languages) {

  /* pre-build style on server start */
  const options = {
    output: 'production', // 'debug' | 'production' | 'omt'
    outPath: __dirname + '/../public/mapstyle',
    i18n: true,
    icons: true,
    pixelRatios: [1, 2],
    styleDir: path.resolve(
      path.join(__dirname, '..', '..', 'node_modules', '@qwant', 'qwant-basic-gl-style'),
    ),
    conf: {
      tileserver_base: '{tileserver_base}',
      tileserver_poi: '{tileserver_poi}',
      spriteserver: '{spriteserver}',
      fontserver: '{fontserver}',
    },
    ignoreSprite: true,
  };

  const builtStyle = styleBuilder(qwantStyle, options);

  return function(req, res) {
    /* get lang routine */
    const langParameter = req.query.lang;
    let matchedLanguage = languages.defaultLanguage;
    if (langParameter) {
      matchedLanguage = languages.supportedLanguages.find(supportedLanguage => {
        return supportedLanguage.code === langParameter;
      });
      if (!matchedLanguage) {
        res.status(400);
        res.send({ error: `Unsupported language code : ${langParameter}` });
        return;
      }
    } else {
      matchedLanguage = languages.defaultLanguage;
    }

    /* config rewriting */
    const host = req.get('host');
    const spritesUrl = Uri.toAbsoluteUrl(
      `https://${host}`,
      config.system.baseUrl,
      config.mapStyle.spritesUrl,
    );
    const fontsUrl = Uri.toAbsoluteUrl(
      `https://${host}`,
      config.system.baseUrl,
      config.mapStyle.fontsUrl,
    );
    const urls = {
      spritesUrl,
      fontsUrl,
    };
    const mapStyle = Object.assign({}, config.mapStyle, urls);

    /* json render */
    res.set('Content-Type', 'application/json');
    res.send(styleConfigure(builtStyle, mapStyle, matchedLanguage.code));
  };
};
