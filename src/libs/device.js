import React from 'react';

export const mobileDeviceMediaQuery = window.matchMedia('(max-width: 640px)');

export function isMobileDevice() {
  return mobileDeviceMediaQuery.matches;
}

export const DeviceContext = React.createContext(isMobileDevice());
