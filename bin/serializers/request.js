/* globals require, module, Buffer */

const bunyan = require('bunyan');

module.exports = function(req) {
  const reqObject = bunyan.stdSerializers.req(req);
  const headers = reqObject.headers;
  for (const k in headers) {
    // geoip headers are utf8 encoded
    if (k.startsWith('x-geoip-')) {
      headers[k] = Buffer.from(headers[k], 'binary').toString('utf8');
    }
  }
  return reqObject;
};
