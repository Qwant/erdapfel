/* globals _ */
import React, { Fragment, useEffect, useState, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import AppMenu from './menu/AppMenu';
import ProductsDrawer from './menu/ProductsDrawer';
import Telemetry from 'src/libs/telemetry';
import { Flex, CloseButton } from 'src/components/ui';
import { IconMenu, IconApps } from 'src/components/ui/icons';
import { DeviceContext } from 'src/libs/device';

const Menu = () => {
  const [openedMenu, setOpenedMenu] = useState(null);
  const menuContainer = useRef(document.createElement('div'));
  const isMobile = useContext(DeviceContext);

  useEffect(() => {
    const current = menuContainer.current;
    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, []);

  useEffect(() => {
    if (openedMenu === 'app') {
      Telemetry.add(Telemetry.MENU_CLICK);
    }
  }, [openedMenu]);

  const close = () => {
    setOpenedMenu(null);
  };

  return (
    <Fragment>
      <Flex className="menu__button-container">
        <button
          type="button"
          className={cx('menu__button', {
            'menu__button--active': openedMenu === 'app',
            'menu__button--noShadow': openedMenu && openedMenu !== 'app',
          })}
          onClick={() => {
            setOpenedMenu('app');
          }}
          title={_('Menu')}
        >
          {isMobile ? <IconMenu /> : <IconMenu width={16} height={16} />}
        </button>

        {!isMobile && (
          <button
            type="button"
            className={cx('u-mr-xs', 'menu__button', {
              'menu__button--active': openedMenu === 'products',
              'menu__button--noShadow': openedMenu && openedMenu !== 'products',
            })}
            onClick={() => {
              setOpenedMenu('products');
            }}
          >
            <IconApps className="u-mr-xxs" />
            {_('Products', 'menu')}
          </button>
        )}
      </Flex>

    {openedMenu && ReactDOM.createPortal(
      <div className={cx('menu', { productsDrawer: openedMenu === 'products' })}>
        <div className="menu__overlay" onClick={close} />

        <div className="menu__panel">
          <Flex className="menu-top">
            <CloseButton circle onClick={close} />
          </Flex>
          <div className="menu-content">
            {openedMenu === 'app'
              ? <AppMenu close={close} openProducts={() => { setOpenedMenu('products'); }}/>
              : <ProductsDrawer />}
          </div>
        </div>
      </div>,
      menuContainer.current,
    )}
  </Fragment>
}

export default Menu
