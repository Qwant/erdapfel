import React, { useState, useEffect } from 'react';

export const mobileDeviceMediaQuery = window.matchMedia('(max-width: 640px)');

export function isMobileDevice() {
  return mobileDeviceMediaQuery.matches;
}

export const DeviceContext = React.createContext({ isMobile: isMobileDevice() });

export const DeviceProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const deviceChanged = ({ matches: isMobile }) => {
      setIsMobile(isMobile);
    };

    mobileDeviceMediaQuery.addEventListener('change', deviceChanged);

    return () => {
      mobileDeviceMediaQuery.removeEventListener('change', deviceChanged);
    };
  }, []);

  return <DeviceContext.Provider value={{ isMobile }}>{children}</DeviceContext.Provider>;
};
