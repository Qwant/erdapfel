const axios = require('axios');

module.exports = function (config) {
  // Use url from server config if defined
  const idunnBaseUrl = config.services.idunn.url;
  const idunnTimeout = Number(config.server.services.idunn.timeout);
  if (isNaN(idunnTimeout)) {
    throw new Error(
      `Invalid config: idunn timeout is set to "${config.server.services.idunn.timeout}"`
    );
  }

  async function getPoi(req, poiId, langCode) {
    let id = poiId;
    const atPos = poiId.indexOf('@');
    if (atPos !== -1) {
      id = poiId.slice(0, atPos);
    }

    try {
      req.logger.error(
        'Request search pois url is : ' + `${idunnBaseUrl}/v1/places/${id}?lang=${langCode}`
      );
      const response = await axios.get(`${idunnBaseUrl}/v1/places/${id}?lang=${langCode}`, {
        timeout: idunnTimeout,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  return function (req, res, next) {
    const placeUrlMatch = req.originalUrl.split('?')[0].match(/place\/(.*)/);
    const poiId = placeUrlMatch && placeUrlMatch[1];

    if (!poiId) {
      next();
      return;
    }

    getPoi(req, poiId, res.locals.language.code)
      .then(poi => {
        if (poi) {
          res.locals.poi = poi;
          next();
        } else {
          req.logger.error('Prefetch 307 response trigger');
          res.redirect(307, config.system.baseUrl);
        }
      })
      .catch(error => {
        req.logger.error({ err: error });
        next();
      });
  };
};
