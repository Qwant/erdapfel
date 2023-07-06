import React from 'react';

export const PanelHeaderHeightContext = React.createContext({
  height: 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setHeight: (number: number) => {
    return;
  },
});
