/* globals _ */
import React, { Fragment, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { navTo, getAppRelativePathname } from 'src/proxies/app_router';
import cx from 'classnames';
import AppMenu from './menu/AppMenu';
import ProductsDrawer from './menu/ProductsDrawer';
import Telemetry from 'src/libs/telemetry';
import { Flex, CloseButton } from 'src/components/ui';
import { IconMenu, IconApps, IconArrowLeft } from 'src/components/ui/icons';
import { useConfig, useDevice } from 'src/hooks';
import { parseQueryString, updateQueryString } from 'src/libs/url_utils';

const Menu = () => {
  const menuContainer = useRef(document.createElement('div'));
  const { isMobile } = useDevice();
  const displayProducts = useConfig('burgerMenu').products;
  const { search, state: historyState } = useLocation();
  const { drawer } = parseQueryString(search);

  useEffect(() => {
    const current = menuContainer.current;
    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, []);

  useEffect(() => {
    if (drawer === 'app') {
      Telemetry.add(Telemetry.MENU_CLICK);
    }
  }, [drawer]);

  const drawerUrl = drawer => getAppRelativePathname() + updateQueryString({ drawer });

  const close = () => {
    navTo(drawerUrl(null), historyState);
  };

  const openDrawer = menu => {
    navTo(drawerUrl(menu), historyState);
  };

  const toggleOpen = menu => {
    if (drawer === menu) {
      close();
    } else {
      openDrawer(menu);
    }
  };

  return (
    <Fragment>
      <Flex className="menu__button-container">
        <button
          type="button"
          className={cx('menu__button', {
            'menu__button--active': drawer === 'app',
            'menu__button--noShadow': drawer && drawer !== 'app',
          })}
          onClick={() => {
            toggleOpen('app');
          }}
          title={_('Menu')}
        >
          {isMobile ? <IconMenu /> : <IconMenu width={16} height={16} />}
        </button>

        {!isMobile && displayProducts && (
          <button
            type="button"
            className={cx('u-mr-xs', 'menu__button', {
              'menu__button--active': drawer === 'products',
              'menu__button--noShadow': drawer && drawer !== 'products',
            })}
            onClick={() => {
              toggleOpen('products');
            }}
          >
            <IconApps className="u-mr-xxs" />
            {_('Products', 'menu')}
          </button>
        )}
      </Flex>

      {drawer &&
        ReactDOM.createPortal(
          <div className={cx('menu', { productsDrawer: drawer === 'products' })}>
            <div className="menu__overlay" onClick={close} />

            <div className="menu__panel">
              <Flex className="menu-top">
                {isMobile && drawer === 'products' && (
                  <>
                    <Flex
                      as="button"
                      justifyContent="center"
                      alignItems="center"
                      type="button"
                      className="u-mr-s"
                      onClick={() => openDrawer('app')}
                      aria-label={_('Go back')}
                    >
                      <IconArrowLeft />
                    </Flex>
                    <div className="u-text--heading5">{_('Products', 'menu')}</div>
                  </>
                )}
                <CloseButton circle onClick={close} />
              </Flex>
              <div className="menu-content">
                {drawer === 'app' ? (
                  <AppMenu
                    close={close}
                    openProducts={isMobile && displayProducts ? () => openDrawer('products') : null}
                  />
                ) : (
                  <ProductsDrawer />
                )}
              </div>
            </div>
          </div>,
          menuContainer.current
        )}
    </Fragment>
  );
};

export default Menu;
