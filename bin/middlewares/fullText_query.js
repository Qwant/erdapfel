const axios = require('axios');

const removeNullEntries = obj =>
  Object.entries(obj)
    .filter(([_key, value]) => value !== null && value !== undefined)
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});

module.exports = function (config) {
  const geocoderUrl = config.services.geocoder.url;
  const useNlu = config.services.geocoder.useNlu;
  const idunnTimeout = Number(config.server.services.idunn.timeout);
  if (isNaN(idunnTimeout)) {
    throw new Error(
      `Invalid config: idunn timeout is set to "${config.server.services.idunn.timeout}"`
    );
  }

  async function getRedirectUrl(query, res) {
    try {
      const response = await axios.get(geocoderUrl, {
        params: {
          lang: res.locals.language.code,
          nlu: useNlu ? 'true' : undefined,
          q: query,
        },
        timeout: idunnTimeout,
      });
      const intention = (response.data.intentions || [])[0];
      if (intention && intention.filter) {
        // @TODO: re-use client code from `src/adapter/intentions.js`
        const { q, bbox, category } = intention.filter;
        const params = new URLSearchParams(
          removeNullEntries({
            q,
            bbox: bbox && bbox.join(','),
            type: category,
          })
        );

        return `${config.system.baseUrl}places/?${params.toString()}`;
      }

      const firstPoi = (response.data.features || [])[0];
      if (firstPoi) {
        return `${config.system.baseUrl}place/${firstPoi.properties.geocoding.id}`;
      }
      return null;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  return function (req, res, next) {
    // interpret only requests matching `/?q=<full_text_query>`
    if (req.path !== '/' || !req.query.q) {
      next();
      return;
    }

    getRedirectUrl(req.query.q, res)
      .then(redirectUrl => {
        if (redirectUrl) {
          res.redirect(307, redirectUrl);
        } else {
          next();
        }
      })
      .catch(error => {
        req.logger.error({ err: error });
        next();
      });
  };
};
