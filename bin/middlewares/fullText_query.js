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
  const geocoderUrl = idunnBaseUrl + '/v1/search';
  const useNlu = config.services.geocoder.useNlu;

  // @TODO: share intention validation with src/adapters/intention.js
  const categories = yaml.readSync('../../config/categories.yml');
  const isCategoryValid = type => categories.find(category => category.name === type);
  const isIntentionValid = intention =>
    intention &&
    intention.filter &&
    (!intention.filter.category || isCategoryValid(intention.filter.category));

  // @TODO: import it from client lib src/libs/url_utils.js when possible
  const removeNullEntries = obj =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));

  async function getRedirectUrl(req, res) {
    const { q: query, client = 'direct-search' } = req.query;
    const response = await axios.get(geocoderUrl, {
      params: {
        lang: res.locals.language.code,
        nlu: useNlu ? 'true' : undefined,
        q: query,
      },
      timeout: idunnTimeout,
    });
    // Return to home if query is empty or equivalent
    if (response.data.geocoding.query === '') {
      return `${config.system.baseUrl}`;
    }
    // Return noresult url if no results were found for an acceptable query
    if (response.status === 204) {
      return `${config.system.baseUrl}noresult?${params.toString()}`;
    }
    const intention = (response.data.intentions || [])[0];
    if (isIntentionValid(intention)) {
      const { q, bbox, category } = intention.filter;
      const params = new URLSearchParams(
        removeNullEntries({
          q,
          bbox: bbox && bbox.join(','),
          type: category,
          client,
        })
      );

      return `${config.system.baseUrl}places/?${params.toString()}`;
    }

    const params = new URLSearchParams({
      q: query,
      client,
    });

    const firstPoi = (response.data.features || [])[0];
    if (firstPoi) {
      return `${config.system.baseUrl}place/${
        firstPoi.properties.geocoding.id
      }?${params.toString()}`;
    }

    return `${config.system.baseUrl}noresult?${params.toString()}`;
  }

  return function (req, res, next) {
    // interpret only requests matching `/?q=<full_text_query>`
    if (req.path !== '/' || !req.query.q) {
      next();
      return;
    }

    getRedirectUrl(req, res)
      .then(redirectUrl => {
        req.logger.error('fulltext query 307 response trigger');
        res.redirect(307, redirectUrl);
      })
      .catch(error => {
        req.logger.error({ err: error });
        next();
      });
  };
};
