function iOSversion(userAgent) {
  if (/iP(hone|od|ad)/.test(userAgent)) {
    const v = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
  }
}

function isUnsupported(userAgent = '') {
  // iOS < 10 detection
  if (iOSversion(userAgent)[0] < 10) {
    return true;
  }

  // old IE detection
  if (userAgent.match('Trident')) {
    return true;
  }
}

module.exports = function (config) {
  const redirect = config.server.unsupportedBrowsers.redirect;

  return function (req, res, next) {
    if (redirect && isUnsupported(req.headers['user-agent'])) {
      res.redirect(302, config.system.baseUrl + 'unsupported');
    } else {
      next();
    }
  };
};
