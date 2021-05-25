import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import Telemetry from 'src/libs/telemetry';
import { Divider } from 'src/components/ui';
import { Heart, IconLightbulb, IconEdit, IconApps } from 'src/components/ui/icons';
import { PINK_DARK, ACTION_BLUE_BASE } from 'src/libs/colors';
import { useConfig, useI18n } from 'src/hooks';

const AppMenu = ({ close, openProducts }) => {
  const { baseUrl } = useConfig('system');
  const { getLocalizedUrl, _ } = useI18n();

  const navTo = (url, options) => {
    close();
    window.app.navigateTo(url, options);
  };

  return (
    <div className="menu-items">
      <MenuItem
        href={baseUrl + 'favs/'}
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
        href={getLocalizedUrl('aboutMapsToS')}
        outsideLink
        icon={<IconLightbulb width={16} fill={ACTION_BLUE_BASE} />}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: _('Terms of service Qwant&nbsp;Maps', 'menu'),
          }}
        />
      </MenuItem>
      <MenuItem
        href={getLocalizedUrl('contributing')}
        outsideLink
        icon={<IconEdit width={16} fill={ACTION_BLUE_BASE} />}
      >
        {_('How to contribute', 'menu')}
      </MenuItem>
      {openProducts && (
        <>
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
        </>
      )}
    </div>
  );
};

AppMenu.propTypes = {
  close: PropTypes.func.isRequired,
  openProducts: PropTypes.func,
};

export default AppMenu;
