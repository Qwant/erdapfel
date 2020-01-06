/* globals require, module, Buffer */

const bunyan = require('bunyan');
const allowedHeaders = [
  'accept',
  'accept-encoding',
  'accept-language',
  'content-type',
  'content-length',
  'host',
  'origin',
  'referer',
  'user-agent',
  'x-client-hash',
  'x-origin',
  'x-uniq-id',
];

const allowedHeadersRules = [
  /^x-forwarded-([^.]*)$/,
  /^x-geoip-([^.]*)$/,
  /^x-qwantmaps-([^.]*)$/,
];

module.exports = function(config) {
  return req => {
    const reqObject = bunyan.stdSerializers.req(req);
    // Shallow copy headers to avoid mutating `req`
    reqObject.headers = { ...reqObject.headers };
    const headers = reqObject.headers;
    for (const k in headers) {
      // geoip headers are utf8 encoded
      if (k.startsWith('x-geoip-')) {
        headers[k] = Buffer.from(headers[k], 'binary').toString('utf8');
      }

      if (config.server.logger.headersWhitelistEnabled) {
        if (
          !allowedHeaders.includes(k) &&
          !allowedHeadersRules.some(rule => rule.test(k))
        ) {
          delete headers[k];
        }
      }
    }
    return reqObject;
  };
};
