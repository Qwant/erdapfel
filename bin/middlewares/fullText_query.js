const axios = require('axios');
const yaml = require('node-yaml');

module.exports = function (config) {
  const idunnTimeout = Number(config.server.services.idunn.timeout);
  if (isNaN(idunnTimeout)) {
    throw new Error(
      `Invalid config: idunn timeout is set to "${config.server.services.idunn.timeout}"`
    );
  }

  const idunnBaseUrl = config.server.services.idunn.url || config.services.idunn.url;
  const geocoderUrl = idunnBaseUrl + '/v1/autocomplete';
  const useNlu = config.services.geocoder.useNlu;

  const categories = yaml.readSync('../../config/categories.yml');
  const isCategoryValid = type => categories.find(category => category.name === type);

  // @TODO: import it from client lib src/libs/url_utils.js when possible
  const removeNullEntries = obj =>
    Object.entries(obj)
      .filter(([_key, value]) => value !== null && value !== undefined)
      .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});

  async function getRedirectUrl(query, res) {
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
      const { q, bbox, category } = intention.filter;
      const params = new URLSearchParams(
        removeNullEntries({
          q,
          bbox: bbox && bbox.join(','),
          type: isCategoryValid(category) ? category : null,
        })
      );

      return `${config.system.baseUrl}places/?${params.toString()}`;
    }

    const firstPoi = (response.data.features || [])[0];
    if (firstPoi) {
      return `${config.system.baseUrl}place/${firstPoi.properties.geocoding.id}?q=${query}`;
    }

    return `${config.system.baseUrl}noresult?q=${query}`;
  }

  return function (req, res, next) {
    // interpret only requests matching `/?q=<full_text_query>`
    if (req.path !== '/' || !req.query.q) {
      next();
      return;
    }

    getRedirectUrl(req.query.q, res)
      .then(redirectUrl => {
        res.redirect(307, redirectUrl);
      })
      .catch(error => {
        req.logger.error({ err: error });
        next();
      });
  };
};
