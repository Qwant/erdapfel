import React, { useEffect, useCallback, useMemo } from 'react';
import cx from 'classnames';
import AppMenu from './menu/AppMenu';
import ProductsDrawer from './menu/ProductsDrawer';
import Telemetry from 'src/libs/telemetry';
import { CloseButton } from 'src/components/ui';
import { RootModal } from 'src/components/RootModal';
import { Flex, IconArrowLeftLine } from '@qwant/qwant-ponents';
import { useConfig, useDevice, useI18n } from 'src/hooks';
import { listen, unListen } from 'src/libs/customEvents';
import { getQueryString, parseQueryString } from 'src/libs/url_utils';
import { useStore } from '../store';

export enum MenuType {
  MENU = 'app',
  PRODUCTS = 'products',
}

const Menu = () => {
  const {
    isMenuDrawerOpen,
    setMenuDrawerOpen,
    isProductsDrawerOpen,
    setProductsDrawerOpen,
  } = useStore(state => state);
  const { isMobile } = useDevice();
  const { _ } = useI18n();
  const displayProducts = useConfig('burgerMenu').products;

  const openMenuFromUrl = useCallback(
    (url: string) => {
      const activeMenuDrawer = parseQueryString(getQueryString(url))['drawer'];
      if (activeMenuDrawer === MenuType.MENU) {
        setMenuDrawerOpen(true);
      } else if (activeMenuDrawer === MenuType.PRODUCTS) {
        setProductsDrawerOpen(true);
      }
    },
    [setMenuDrawerOpen, setProductsDrawerOpen]
  );

  useEffect(() => {
    openMenuFromUrl(window.location.href);

    const routeChangeHandler = listen('routeChange', openMenuFromUrl);
    return () => {
      unListen(routeChangeHandler);
    };
  }, [openMenuFromUrl]);

  useEffect(() => {
    if (isMenuDrawerOpen) {
      Telemetry.add(Telemetry['MENU_CLICK']);
    }
  }, [isMenuDrawerOpen]);

  const closeDrawers = useCallback(() => {
    setProductsDrawerOpen(false);
    setMenuDrawerOpen(false);
  }, [setMenuDrawerOpen, setProductsDrawerOpen]);

  const isMenuOpen = useMemo(() => isMenuDrawerOpen || isProductsDrawerOpen, [
    isMenuDrawerOpen,
    isProductsDrawerOpen,
  ]);

  return (
    <RootModal>
      {isMenuOpen && (
        <div className={cx('menu', { productsDrawer: isProductsDrawerOpen })}>
          <div className="menu__overlay" onClick={closeDrawers} />
          <div className="menu__panel">
            <Flex alignCenter className="menu-top">
              {isMobile && isProductsDrawerOpen && (
                <>
                  <Flex
                    as="button"
                    center
                    alignCenter
                    type="button"
                    className="u-mr-s"
                    onClick={() => {
                      setProductsDrawerOpen(false);
                      setMenuDrawerOpen(true);
                    }}
                    aria-label={_('Go back')}
                  >
                    <IconArrowLeftLine size={24} />
                  </Flex>
                  <div className="u-text--heading5">{_('Products', 'menu')}</div>
                </>
              )}
              <CloseButton circle onClick={closeDrawers} />
            </Flex>
            <div className="menu-content">
              {isMenuDrawerOpen && !isProductsDrawerOpen && (
                <AppMenu
                  close={() => setMenuDrawerOpen(false)}
                  openProducts={
                    isMobile && displayProducts ? () => setProductsDrawerOpen(true) : null
                  }
                />
              )}
              {isProductsDrawerOpen && <ProductsDrawer />}
            </div>
          </div>
        </div>
      )}
    </RootModal>
  );
};

export default Menu;
