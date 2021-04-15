module.exports = function (config) {
  function openGraphMetas(req, res) {
    const ogMetas = [
      { name: 'type', content: 'website' },
      { name: 'site_name', content: 'Qwant Maps' },
      {
        name: 'image',
        content: `https://${req.get('host')}${
          config.system.baseUrl
        }statics/images/qwant_logo_og.png`,
      },
      { name: 'locale', content: res.locals.language.locale },
      {
        name: 'description',
        content: res.locals._('The map that respects your privacy'),
      },
    ];

    // POI will exist if the preFetch middleware has fetched one
    const poi = res.locals.poi;
    if (poi) {
      ogMetas.push({ name: 'title', content: poi.name });
      ogMetas.push({ name: 'url', content: getUrl(req, poi) });
    } else {
      ogMetas.push({ name: 'title', content: 'Qwant Maps' });
      ogMetas.push({ name: 'url', content: getUrl(req) });
    }
    res.locals.ogMetas = ogMetas;
  }

  function getUrl(req, poi) {
    const poiPath = poi ? `place/${poi.id}` : '';
    return `https://${req.get('host')}${config.system.baseUrl}${poiPath}`;
  }

  return function (req, res, next) {
    openGraphMetas(req, res);
    next();
  };
};
