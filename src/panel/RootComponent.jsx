import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Menu from 'src/panel/Menu';
import PanelManager from 'src/panel/PanelManager';
import Suggest from 'src/components/ui/Suggest';
import { isMobileDevice, mobileDeviceMediaQuery, DeviceContext } from 'src/libs/device';
import { fire } from 'src/libs/customEvents';
import { togglePanelVisibility } from 'src/libs/panel';

const MenuComponent = ({ isMobile }) =>
  isMobile
    ? ReactDOM.createPortal(<Menu />, document.querySelector('#react_menu__container'))
    : <Menu />;

const RootComponent = ({
  burgerMenuEnabled,
  searchBarInputNode,
  router,
}) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  console.log(searchBarInputNode);

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
    {burgerMenuEnabled && <MenuComponent isMobile={isMobile} />}
    <Suggest
      inputNode={searchBarInputNode}
      outputNode={document.querySelector('.search_form__result')}
      withCategories
      onToggleSuggestions={suggestionsOpened => { togglePanelVisibility(!suggestionsOpened); }}
    />
  </DeviceContext.Provider>;
};

export default RootComponent;
