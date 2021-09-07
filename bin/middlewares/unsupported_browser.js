function isOldIE(userAgent) {
  return userAgent.match('Trident'); // Test for IE <= 11
}

function isOldiOS(userAgent) {
  if (/iP(hone|od|ad)/.test(userAgent)) {
    const v = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (v && v[1]) {
      return parseInt(v[1], 10) < 10; // test if major iOS version is < 10
    }
  }
}

function isUnsupported(userAgent = '') {
  if (isOldIE(userAgent) || isOldiOS(userAgent)) {
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
