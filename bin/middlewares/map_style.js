const styleBuilder = require('@qwant/map-style-builder');
const styleConfigure = require('@qwant/mapbox_style_configure');
const qwantStyle = require('@qwant/qwant-basic-gl-style/style.json');
const path = require('path');
const Uri = require('@qwant/uri');
const { query, validationResult } = require('express-validator');

const LayersEnum = Object.freeze({
  ALL: 'all',
  NOPOI: 'nopoi',
});

module.exports = function (config, constants) {
  /* pre-build style on server start */
  const options = {
    output: 'production', // 'debug' | 'production' | 'omt'
    outPath: __dirname + '/../public/mapstyle',
    i18n: true,
    icons: true,
    pixelRatios: [1, 2],
    styleDir: path.resolve(
      path.join(__dirname, '..', '..', 'node_modules', '@qwant', 'qwant-basic-gl-style')
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

  const styleCache = {};

  const getStyle = function ({ host, lang, nopoi }) {
    const cacheKey = `${host};${lang};${nopoi}`;
    const cachedStyle = styleCache[cacheKey];
    if (cachedStyle) {
      return cachedStyle;
    }

    /* config rewriting */
    const spritesUrl = Uri.toAbsoluteUrl(
      `https://${host}`,
      config.system.baseUrl,
      config.mapStyle.spritesUrl
    );
    const fontsUrl = Uri.toAbsoluteUrl(
      `https://${host}`,
      config.system.baseUrl,
      config.mapStyle.fontsUrl
    );
    const urls = {
      spritesUrl,
      fontsUrl,
    };
    const mapStyle = Object.assign({}, config.mapStyle, urls);
    const configuredStyle = styleConfigure(builtStyle, mapStyle, lang);

    if (nopoi) {
      configuredStyle.layers = configuredStyle.layers.filter(
        layer => !constants.map.pois_layers.includes(layer.id)
      );
    }

    styleCache[cacheKey] = configuredStyle;
    return configuredStyle;
  };

  const languages = constants.languages;

  return [
    query('lang')
      .default(languages.defaultLanguage.code)
      .customSanitizer(lang => {
        const langValue = lang.split(/-|_/)[0];
        const matchedLanguage = languages.supportedLanguages.find(supportedLanguage => {
          return supportedLanguage.code === langValue;
        });
        if (!matchedLanguage) {
          return languages.defaultLanguage.code;
        }
        return matchedLanguage.code;
      }),
    query('layers')
      .default(LayersEnum.ALL)
      .custom(layers => {
        if (!Object.values(LayersEnum).includes(layers)) {
          throw Error('Unknown value for "layers"');
        }
        return true;
      }),
    function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      res.set('Content-Type', 'application/json');
      res.send(
        getStyle({
          host: req.get('host'),
          lang: req.query.lang,
          nopoi: req.query.layers === LayersEnum.NOPOI,
        })
      );
    },
  ];
};
