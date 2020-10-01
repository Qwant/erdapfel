/* globals require, module */
const yaml = require('node-yaml');
const regions = yaml.readSync('../../config/regions.yaml');

module.exports = function(req, res, next) {
  const countryCode = req.get('x-geoip-country-code');
  const regionCode = req.get('x-geoip-region-code');
  let region;
  if (countryCode && regionCode) {
    region = regions[`${countryCode}-${regionCode}`];
  }
  if (!region && countryCode) {
    region = regions[countryCode];
  }
  res.locals.initialBbox = region ? region.bbox : null;
  next();
};
