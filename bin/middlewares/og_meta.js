module.exports = function (config) {
  function openGraphMetas(req, res) {
    const titles = {
      en: 'Qwant Maps - The map service that does not track you',
      fr: 'Qwant Maps - La cartographie qui ne vous trace pas',
      de: 'Qwant Maps - Die Kartendienst, die Sie nicht verfolgt',
      es: 'Qwant Maps - Cartografía que no te rastrea',
      it: 'Qwant Maps - La cartograpfia che non ti rintraccia',
    };

    const descriptions = {
      en: 'The map service that finds the right addresses and guides you around without tracking you.',
      fr: 'Le service de cartographie qui trouve les bonnes adresses et facilite vos déplacements sans vous tracer.',
      de: 'Der Kartendienst, der die richtigen Adressen findet und Ihre Mobilität vereinfacht, ohne Sie zu tracken.',
      es: 'El servicio de cartografía que encuentra las direcciones correctas y facilita los desplazamientos sin que te sigan la pista.',
      it: 'Il servizio di cartografia che trova gli indirizzi giusti e facilita i tuoi spostamenti senza tracciarti.',
    };

    const ogMetas = [
      { name: 'type', content: 'website' },
      { name: 'site_name', content: 'Qwant Maps' },
      {
        name: 'image',
        content: `https://${req.get('host')}${config.system.baseUrl}statics/images/facebook.png`,
      },
      { name: 'image:width', content: '1000' },
      { name: 'image:height', content: '536' },
      { name: 'locale', content: res.locals.language.locale },
      {
        name: 'description',
        content: descriptions[res.locals.language.code] || descriptions['en'],
      },
    ];

    // POI will exist if the preFetch middleware has fetched one
    const poi = res.locals.poi;
    if (poi) {
      ogMetas.push({ name: 'title', content: poi.name });
      ogMetas.push({ name: 'url', content: getUrl(req, poi) });
    } else {
      ogMetas.push({ name: 'title', content: titles[res.locals.language.code] || titles['en'] });
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
