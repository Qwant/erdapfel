/* globals _ */
import React, { Fragment, useEffect, useState, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import MenuItem from './menu/MenuItem';
import Telemetry from 'src/libs/telemetry';
import { CloseButton, Flex } from 'src/components/ui';
import { Heart, IconLightbulb, IconEdit, IconMenu } from 'src/components/ui/icons';
import { PINK_DARK, ACTION_BLUE_BASE } from 'src/libs/colors';
import { DeviceContext } from 'src/libs/device';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuContainer = useRef(document.createElement('div'));
  const isMobile = useContext(DeviceContext);

  useEffect(() => {
    const current = menuContainer.current;
    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, []);

  const toggle = () => {
    if (!isOpen) {
      Telemetry.add(Telemetry.MENU_CLICK);
    }
    setIsOpen(!isOpen);
  };

  const close = () => {
    setIsOpen(false);
  };

  const navTo = (url, options) => {
    close();
    window.app.navigateTo(url, options);
  };

  return (
    <Fragment>
      <button
        type="button"
        className={cx('menu__button', { 'menu__button--active': isOpen })}
        onClick={toggle}
        title={_('Menu')}
      >
        {isMobile ? <IconMenu /> : <IconMenu width={16} height={16} />}
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div className="menu">
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
                  <span
                    dangerouslySetInnerHTML={{
                      __html: _('Terms of service Qwant&nbsp;Maps', 'menu'),
                    }}
                  />
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
          </div>,
          menuContainer.current
        )}
    </Fragment>
  );
};

export default Menu;
