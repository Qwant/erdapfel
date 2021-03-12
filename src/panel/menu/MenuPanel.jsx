/* globals _ */
import React from 'react';
import MenuItem from './MenuItem';
import Telemetry from 'src/libs/telemetry';
import { CloseButton, Flex } from 'src/components/ui';
import { Heart, IconLightbulb, IconEdit } from 'src/components/ui/icons';
import { PINK_DARK, ACTION_BLUE_BASE } from 'src/libs/colors';

const MenuPanel = ({ close }) => {
  const navTo = (url, options) => {
    close();
    window.app.navigateTo(url, options);
  };

  return <div className="menu">
    <div className="menu__overlay" onClick={close} />

    <div className="menu__panel">
      <Flex className="menu-top u-mb-l">
        <CloseButton circle onClick={close} />
      </Flex>
      <div className="menu-items">
        <MenuItem
          onClick={e => {
            e.preventDefault();
            Telemetry.add(Telemetry.MENU_FAVORITE);
            navTo('/favs/');
          }}
          icon={<Heart width={16} color={PINK_DARK} />}
        >
          {_('My favorites', 'menu')}
        </MenuItem>
        <MenuItem
          href="https://about.qwant.com/legal/terms-of-service/qwant-maps/"
          outsideLink
          icon={<IconLightbulb width={16} fill={ACTION_BLUE_BASE} />}
        >
          {_('About Qwant Maps', 'menu')}
        </MenuItem>
        <MenuItem
          href="https://github.com/Qwant/qwantmaps/blob/master/contributing.md"
          outsideLink
          icon={<IconEdit width={16} fill={ACTION_BLUE_BASE} />}
        >
          {_('How to contribute', 'menu')}
        </MenuItem>
      </div>
    </div>
  </div>;
};

export default MenuPanel;
