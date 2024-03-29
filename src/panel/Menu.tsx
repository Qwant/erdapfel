import React, { useEffect, useCallback, useMemo } from 'react';
import cx from 'classnames';
import AppMenu from './menu/AppMenu';
import ProductsDrawer from './menu/ProductsDrawer';
import Telemetry from 'src/libs/telemetry';
import { CloseButton } from 'src/components/ui';
import { RootModal } from 'src/components/RootModal';
import { Flex } from '@qwant/qwant-ponents';
import { useConfig, useDevice, useI18n } from 'src/hooks';
import { getQueryString, parseQueryString } from 'src/libs/url_utils';
import { useStore } from '../store';

export enum MenuType {
  MENU = 'app',
  PRODUCTS = 'products',
}

const Menu: React.FunctionComponent = () => {
  const { isMenuDrawerOpen, setMenuDrawerOpen, isProductsDrawerOpen, setProductsDrawerOpen } =
    useStore();
  const { isMobile } = useDevice();
  const { _ } = useI18n();
  const {
    burgerMenu: { products: displayProducts },
  } = useConfig();

  const openMenuFromUrl = useCallback(
    (url: string) => {
      const activeMenuDrawer = parseQueryString(getQueryString(url))['drawer'] as MenuType;
      if (activeMenuDrawer === MenuType.MENU) {
        setMenuDrawerOpen(true);
      } else if (activeMenuDrawer === MenuType.PRODUCTS) {
        setProductsDrawerOpen(true);
      }
    },
    [setMenuDrawerOpen, setProductsDrawerOpen]
  );

  const closeDrawers = useCallback(() => {
    setProductsDrawerOpen(false);
    setMenuDrawerOpen(false);
  }, [setMenuDrawerOpen, setProductsDrawerOpen]);

  // Initial render
  useEffect(() => {
    openMenuFromUrl(window.location.href);
  }, [openMenuFromUrl]);

  // Telemetry
  useEffect(() => {
    if (isMenuDrawerOpen) {
      Telemetry.add(Telemetry['MENU_CLICK']);
    }
  }, [isMenuDrawerOpen]);

  const isMenuOpen = useMemo(
    () => isMenuDrawerOpen || isProductsDrawerOpen,
    [isMenuDrawerOpen, isProductsDrawerOpen]
  );

  return (
    <RootModal>
      {isMenuOpen && (
        <div className={cx('menu', { productsDrawer: isProductsDrawerOpen })}>
          <div className="menu__overlay" onClick={closeDrawers} />
          <div className="menu__panel">
            <Flex alignCenter className="menu-top" between>
              <div className="u-text--heading6">
                {_(isProductsDrawerOpen ? 'Products' : 'Menu')}
              </div>
              <CloseButton
                circle={false}
                onClick={closeDrawers}
                className="menu-top-close-button"
              />
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
