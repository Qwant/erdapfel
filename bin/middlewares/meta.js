// Generate all meta tags (charset, description, og, twitter)
module.exports = function (config) {
  function metas(req, res) {
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

    const description = descriptions[res.locals.language.code] || descriptions['en'];

    let title, url;

    const poi = res.locals.poi;

    if (poi) {
      title = poi.name;
      url = getUrl(req, poi);
    } else {
      title = titles[res.locals.language.code] || titles['en'];
      url = getUrl(req);
    }

    const metas = [
      `<meta charset="utf-8" />`,
      `<meta http-equiv="X-UA-Compatible" content="IE=edge">`,
      `<meta name="theme-color" content="#FFFFFF">`,
      `<meta name="description" content="${description}"/>`,
      `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>`,
      `<meta name="keywords" content="maps search engine privacy"/>`,
      `<meta property="og:description" content="${description}"/>`,
      `<meta property="og:title" content="${title}"/>`,
      `<meta property="og:site_name" content="Qwant Maps"/>`,
      `<meta property="og:image" content="https://${getUrl(req)}statics/images/facebook.png"/>`,
      `<meta property="og:image:width" content="1000" />`,
      `<meta property="og:image:height" content="536" />`,
      `<meta property="og:type" content="website"/>`,
      `<meta property="og:locale" content="${res.locals.language.locale}"/>`,
      `<meta property="og:url" content="${url}"/>`,
      `<meta name="application-name" content="Qwant"/>`,
      `<meta name="twitter:title" content="${title}"/>`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:image" content="https://${getUrl(req)}statics/images/twitter.jpg">`,
      `<meta name="twitter:site" content="@QwantCom">`,
      `<meta name="twitter:creator" content="@QwantCom">`,
      `<meta name="twitter:domain" content="https://${url}">`,
      `<meta name="twitter:widgets:csp" content="on"/>`,
    ];

    res.locals.metas = metas;
  }

  function getUrl(req, poi) {
    const poiPath = poi ? `place/${poi.id}` : '';
    return `https://${req.get('host')}${config.system.baseUrl}${poiPath}`;
  }

  return function (req, res, next) {
    metas(req, res);
    next();
  };
};
