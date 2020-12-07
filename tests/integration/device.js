
const viewports = {
  mobile: {
    width: 400,
    height: 800,
    hasTouch: true,
    isMobile: true,
  },
  desktop: {
    width: 800,
    height: 600,
  },
};

const ignorePatterns = {
  mobile: ['.desktop.'],
  desktop: ['.mobile.'],
};

function getPupeeterViewport(deviceName) {
  return viewports[deviceName] || null;
}

function getIgnorePatterns(deviceName) {
  return ignorePatterns[deviceName] || [];
}

module.exports = {
  getPupeeterViewport,
  getIgnorePatterns,
};
