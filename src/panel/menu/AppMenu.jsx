/* globals _ */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import Telemetry from 'src/libs/telemetry';
import { CloseButton, Flex, Divider } from 'src/components/ui';
import { Heart, IconLightbulb, IconEdit, IconApps } from 'src/components/ui/icons';
import { PINK_DARK, ACTION_BLUE_BASE } from 'src/libs/colors';
import { DeviceContext } from 'src/libs/device';

const AppMenu = ({ close, openProducts }) => {
  const isMobile = useContext(DeviceContext);

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
          <span dangerouslySetInnerHTML={{
            __html: _('Terms of service Qwant&nbsp;Maps', 'menu') }} />
        </MenuItem>
        <MenuItem
          href="https://github.com/Qwant/qwantmaps/blob/master/contributing.md"
          outsideLink
          icon={<IconEdit width={16} fill={ACTION_BLUE_BASE} />}
        >
          {_('How to contribute', 'menu')}
        </MenuItem>
        {isMobile && <>
          <Divider />
          <MenuItem
            onClick={e => {
              e.preventDefault();
              openProducts();
            }}
            icon={<IconApps width={16} fill={ACTION_BLUE_BASE} />}
          >
            {_('Products', 'menu')}
          </MenuItem>
        </>}
      </div>
    </div>
  </div>;
};

AppMenu.propTypes = {
  close: PropTypes.func.isRequired,
  openProducts: PropTypes.func.isRequired,
};

export default AppMenu;
