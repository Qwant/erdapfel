const axios = require('axios');

module.exports = function (config) {
  const geocoderUrl = config.services.geocoder.url;
  const idunnTimeout = Number(config.server.services.idunn.timeout);
  if (isNaN(idunnTimeout)) {
    throw new Error(
      `Invalid config: idunn timeout is set to "${config.server.services.idunn.timeout}"`
    );
  }

  async function getFullTextBbox(query, langCode) {
    try {
      const response = await axios.get(geocoderUrl, {
        params: {
          lang: langCode,
          nlu: 'true',
          q: query,
        },
        timeout: idunnTimeout,
      });
      const intention = (response.data.intentions || [])[0];
      if (intention && intention.filter && intention.filter.bbox) {
        return intention.filter.bbox;
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
    const absoluteUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const fullTextQuery = new URL(absoluteUrl).searchParams.get('q');

    if (!fullTextQuery) {
      next();
      return;
    }

    getFullTextBbox(fullTextQuery, res.locals.language.code)
      .then(bbox => {
        if (bbox) {
          res.locals.queryBbox = bbox;
        }
      })
      .catch(error => {
        req.logger.error({ err: error });
      })
      .finally(next);
  };
};
