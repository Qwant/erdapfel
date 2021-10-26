import React, { useEffect } from 'react';
import Menu from 'src/panel/Menu';
import PanelManager from 'src/panel/PanelManager';
import { PoiProvider } from 'src/libs/poiContext';
import { fire } from 'src/libs/customEvents';
import { useConfig, useDevice } from 'src/hooks';

const RootComponent = ({ router }) => {
  const { enabled: isBurgerMenuEnabled } = useConfig('burgerMenu');
  const { isMobile } = useDevice();

  useEffect(() => {
    document.body.dataset.device = isMobile ? 'mobile' : 'desktop';
    if (!isMobile) {
      window.execOnMapLoaded(() => {
        fire('move_mobile_bottom_ui', 0);
      });
    }
    fire('update_map_paddings');
  }, [isMobile]);

  return (
    <>
      <PoiProvider>
        <PanelManager router={router} />
      </PoiProvider>
      {!isMobile && isBurgerMenuEnabled && <Menu />}
    </>
  );
};

export default RootComponent;
