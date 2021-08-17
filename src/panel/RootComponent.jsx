import React, { useState, useEffect } from 'react';
import { Router } from 'react-router-dom';
import { basename, history } from 'src/proxies/app_router';
import Menu from 'src/panel/Menu';
import PanelManager from 'src/panel/PanelManager';
import { isMobileDevice, mobileDeviceMediaQuery, DeviceContext } from 'src/libs/device';
import { fire } from 'src/libs/customEvents';
import { useConfig } from 'src/hooks';
import { PoiProvider } from 'src/libs/poiContext';

const RootComponent = () => {
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
    <Router history={history} basename={basename}>
      <DeviceContext.Provider value={{ isMobile }}>
        <PoiProvider>
          <PanelManager />
        </PoiProvider>
        {!isMobile && isBurgerMenuEnabled && <Menu />}
      </DeviceContext.Provider>
    </Router>
  );
};

export default RootComponent;
