/**
 * Compute the group test of the user according to his user hash.
 *
 * @param config - The app config object
 * @param req - The request object of Express
 * @returns {number} The user group, there are ten user groups : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
 */
function getTestNPercent(config, req) {
  const tgp = req.query.tgp;
  if (tgp !== '' && !isNaN(tgp)) {
    return Math.floor(parseInt(tgp) / 10) * 10;
  }

  const clientHash = req.get('X-Client-Hash') || config.server.clientHashFallback;
  return getTgpFromHash(clientHash);
}

function getTgpFromHash(hash) {
  if (!hash) return 0;
  const lastByte = parseInt(hash.charAt(hash.length - 2) + hash.charAt(hash.length - 1), 16);

  return Math.ceil(((lastByte + 1) / 256) * 10) * 10;
}

function getABTestingInfos(config, req) {
  const testGroupPer = getTestNPercent(config, req);
  return { testGroupPer };
}

module.exports = getABTestingInfos;
