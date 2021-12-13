import React, { useState, useEffect } from 'react';

const mobileDeviceMaxWidth = 640;

export function isMobileDevice() {
  return window.innerWidth <= mobileDeviceMaxWidth;
}

export const DeviceContext = React.createContext({ isMobile: isMobileDevice() });

export const DeviceProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const deviceChanged = () => {
      setIsMobile(window.innerWidth <= mobileDeviceMaxWidth);
    };

    window.addEventListener('resize', deviceChanged);

    return () => {
      window.removeEventListener('resize', deviceChanged);
    };
  }, []);

  return <DeviceContext.Provider value={{ isMobile }}>{children}</DeviceContext.Provider>;
};
