import React from 'react';

export const PanelContext = React.createContext({
  size: 'default',
  setSize: () => undefined,
});
