import React, { useState, createContext } from 'react';

export const PoiContext = createContext({
  activePoi: null,
  setActivePoi: () => undefined,
});

export const PoiProvider = ({ children }) => {
  const [activePoi, setActivePoi] = useState(null);

  return <PoiContext.Provider value={{ activePoi, setActivePoi }}>{children}</PoiContext.Provider>;
};
