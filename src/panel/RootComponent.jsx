import React, { useState, useEffect } from 'react';
import Menu from 'src/panel/Menu';
import PanelManager from 'src/panel/PanelManager';
import { isMobileDevice, mobileDeviceMediaQuery, DeviceContext } from 'src/libs/device';
import { fire } from 'src/libs/customEvents';
import BetaInfoBox from 'src/components/BetaInfoBox';
import { useConfig } from 'src/hooks';

const RootComponent = ({ router }) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  const { enabled: isBurgerMenuEnabled } = useConfig('burgerMenu');

  useEffect(() => {
    const deviceChanged = ({ matches: isMobile }) => {
      setIsMobile(isMobile);
      if (!isMobile) {
        window.execOnMapLoaded(() => {
          fire('move_mobile_bottom_ui', 0);
        });
      }
      fire('update_map_paddings');
    };

    mobileDeviceMediaQuery.addListener(deviceChanged);

    return () => {
      mobileDeviceMediaQuery.removeListener(deviceChanged);
    };
  });

  return (
    <DeviceContext.Provider value={{ isMobile }}>
      <PanelManager router={router} />
      {!isMobile && isBurgerMenuEnabled && <Menu />}
      <BetaInfoBox />
    </DeviceContext.Provider>
  );
};

export default RootComponent;
