import React from 'react';

const mediaQuery = window.matchMedia('(max-width: 640px)');

export function isMobileDevice() {
  return mediaQuery.matches;
}

export function onDeviceSizeChange(callback /* isMobile => {…} */ ) {
  return mediaQuery.addListener(mediaQueryEvent => {
    callback(mediaQueryEvent.matches);
  });
}

export const DeviceContext = React.createContext({ isMobile: isMobileDevice() });
