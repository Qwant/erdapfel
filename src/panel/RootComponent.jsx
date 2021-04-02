import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Menu from 'src/panel/Menu';
import PanelManager from 'src/panel/PanelManager';
import { isMobileDevice, mobileDeviceMediaQuery, DeviceContext } from 'src/libs/device';
import { fire } from 'src/libs/customEvents';
import BetaInfoBox from 'src/components/BetaInfoBox';

const MenuComponent = ({ isMobile }) =>
  isMobile ? (
    ReactDOM.createPortal(<Menu />, document.querySelector('#react_menu__container'))
  ) : (
    <Menu />
  );

const RootComponent = ({ burgerMenuEnabled, router }) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

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
    <DeviceContext.Provider value={isMobile}>
      <PanelManager
        router={router}
        searchBarInputNode={document.getElementById('search')}
        searchBarOutputNode={document.querySelector('.search_form__result')}
      />
      {burgerMenuEnabled && <MenuComponent isMobile={isMobile} />}
      <BetaInfoBox />
    </DeviceContext.Provider>
  );
};

export default RootComponent;
