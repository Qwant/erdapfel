/* globals require, module */

const request = require('request');

module.exports = function(config) {
  // Use url from server config if defined
  const idunnBaseUrl = config.server.services.idunn.url || config.services.idunn.url;
  const idunnTimeout = Number(config.server.services.idunn.timeout);
  if (isNaN(idunnTimeout)) {
    throw new Error(
      `Invalid config: idunn timeout is set to "${config.server.services.idunn.timeout}"`,
    );
  }

  async function getPoi(poiId, locale) {
    let id = poiId;
    const atPos = poiId.indexOf('@');
    if (atPos !== -1) {
      id = poiId.slice(0, atPos);
    }

    return new Promise((resolve, reject) => {
      const idunnUrl = `${idunnBaseUrl}/v1/places/${id}?lang=${locale.code}`;
      request({
        url: idunnUrl,
        timeout: idunnTimeout,
        json: true,
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode === 404) {
          resolve(null);
        } else {
          resolve(body);
        }
      });
    });
  }

  function commonMeta(locale, req, res) {
    res.locals.ogMetas = [];
    res.locals.ogMetas.push({ name: 'type', content: 'website' });
    res.locals.ogMetas.push({ name: 'site_name', content: 'Qwant Maps' });
    res.locals.ogMetas.push({
      name: 'image',
      content: `https://${req.get('host')}${config.system.baseUrl}statics/images/qwant_logo_og.png`,
    });
    res.locals.ogMetas.push({ name: 'locale', content: locale.locale });
    res.locals.ogMetas.push({
      name: 'description',
      content: res.locals._('The map that respects your privacy'),
    });
  }

  function poiMeta(poi, locale, req, res, next) {
    commonMeta(locale, req, res);
    res.locals.poi = poi;
    res.locals.ogMetas.push({ name: 'title', content: poi.name });
    res.locals.ogMetas.push({ name: 'url', content: getUrl(req, poi) });

    next();
  }

  function homeMeta(locale, req, res, next) {
    commonMeta(locale, req, res);
    res.locals.ogMetas.push({ name: 'title', content: 'Qwant Maps' });
    res.locals.ogMetas.push({ name: 'url', content: getUrl(req) });

    next();
  }

  function getUrl(req, poi) {
    let poiPath = '';
    if (poi) {
      poiPath = `place/${poi.id}`;
    }
    return `https://${req.get('host')}${config.system.baseUrl}${poiPath}`;
  }

  return function(req, res, next) {
    const placeUrlMatch = req.originalUrl.match(/place\/(.*)/);
    const locale = res.locals.language;
    if (placeUrlMatch && placeUrlMatch.length > 0) {
      const poiId = placeUrlMatch[1];
      getPoi(poiId, locale).then(poi => {
        if (poi) {
          poiMeta(poi, locale, req, res, next);
        } else {
          res.redirect(307, config.system.baseUrl);
        }
      }).catch(error => {
        req.logger.error({ err: error });
        homeMeta(locale, req, res, next);
      });
    } else {
      homeMeta(locale, req, res, next);
    }
  };
};
