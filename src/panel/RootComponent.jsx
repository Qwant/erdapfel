import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Menu from 'src/panel/Menu';
import PanelManager from 'src/panel/PanelManager';
import Suggest from 'src/components/ui/Suggest';
import { isMobileDevice, mobileDeviceMediaQuery, DeviceContext } from 'src/libs/device';
import { fire } from 'src/libs/customEvents';

const RootComponent = ({
  burgerMenuEnabled,
  searchBarInputNode,
  router,
}) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const deviceChanged = ({ matches: isMobile }) => {
      setIsMobile(isMobile);
      if (!isMobile) {
        window.execOnMapLoaded(() => { fire('move_mobile_bottom_ui', 0); });
      }
    };

    mobileDeviceMediaQuery.addListener(deviceChanged);

    return () => {
      mobileDeviceMediaQuery.removeListener(deviceChanged);
    };
  });

  return <DeviceContext.Provider value={isMobile}>
    <PanelManager router={router} />
    {burgerMenuEnabled
      && ReactDOM.createPortal(<Menu />, document.querySelector('#react_menu__container'))}
    <Suggest
      inputNode={searchBarInputNode}
      withCategories
    />
  </DeviceContext.Provider>;
};

export default RootComponent;
