import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import Telemetry from 'src/libs/telemetry';
import { Divider } from 'src/components/ui';
import { IconHeart, IconHistory, IconEdit, IconBug } from 'src/components/ui/icons';
import { IconLight, IconApps } from '@qwant/qwant-ponents';
import { PINK_DARK, ACTION_BLUE_BASE, PURPLE } from 'src/libs/colors';
import { useConfig, useI18n } from 'src/hooks';

const AppMenu = ({ close, openProducts }) => {
  const { baseUrl } = useConfig('system');
  const { getLocalizedUrl, _ } = useI18n();
  const searchHistoryConfig = useConfig('searchHistory');

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
        icon={<IconHeart width={16} fill={PINK_DARK} />}
      >
        {_('My favorites', 'menu')}
      </MenuItem>
      {searchHistoryConfig?.enabled && (
        <MenuItem
          href={baseUrl + 'history/'}
          onClick={e => {
            e.preventDefault();
            navTo('/history/');
          }}
          icon={<IconHistory width={16} fill={PURPLE} />}
        >
          {_('My search history', 'menu')}
        </MenuItem>
      )}
      <MenuItem
        href={getLocalizedUrl('aboutMapsToS')}
        outsideLink
        icon={<IconLight size={16} fill={ACTION_BLUE_BASE} />}
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
      <MenuItem
        href={getLocalizedUrl('reportBug')}
        outsideLink
        icon={<IconBug width={16} fill={ACTION_BLUE_BASE} />}
      >
        {_('Report a bug', 'menu')}
      </MenuItem>

      {openProducts && (
        <>
          <Divider />
          <MenuItem
            onClick={e => {
              e.preventDefault();
              openProducts();
            }}
            icon={<IconApps size={16} fill={ACTION_BLUE_BASE} />}
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
