/* globals _ */
import React, { Fragment, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { menu as menuItems } from '../../config/constants.yml';
import nconf from '@qwant/nconf-getter';
import MenuItem from './menu/MenuItem';
import MenuButton from './menu/MenuButton';
import Telemetry from 'src/libs/telemetry';

const isDirectionActive = nconf.get().direction.enabled;

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuContainer = useRef(document.createElement('div'));

  useEffect(() => {
    const current = menuContainer.current;
    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, []);

  const open = () => {
    Telemetry.add(Telemetry.MENU_CLICK);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const navTo = (url, options) => {
    close();
    window.app.navigateTo(url, options);
  };

  return <Fragment>
    <MenuButton onClick={open} />

    {isOpen && ReactDOM.createPortal(<div className="menu">
      <div className="menu__overlay" onClick={close} />

      <div className="menu__panel">
        <div className="menu__panel__top">
          <h2 className="menu__panel__top__title">
            <i className="menu__panel__top__icon icon-map" />
            <span>Qwant Maps</span>
            <i className="icon-x menu__panel__top__close" onClick={close} />
          </h2>
        </div>

        <div className="menu__panel__items_container">
          <div className="menu__panel__section menu__panel__section-internal">
            <button className="menu__panel__action"
              onClick={() => { navTo('/', { focusSearch: true }); }}
            >
              <img
                className="menu__panel__action__icon"
                src="./statics/images/magnifier-dark.svg" alt=""
              />
              <span>{_('Search', 'menu')}</span>
            </button>
            {isDirectionActive &&
              <button className="menu__panel__action" onClick={() => {
                Telemetry.add(Telemetry.MENU_ITINERARY);
                navTo('/routes/');
              }}>
                <i className="menu__panel__action__icon icon-corner-up-right" />
                <span>{_('Directions', 'menu')}</span>
              </button>
            }
            <button className="menu__panel__action" onClick={() => {
              Telemetry.add(Telemetry.MENU_FAVORITE);
              navTo('/favs/');
            }}>
              <i className="menu__panel__action__icon icon-icon_star" />
              <span>{_('Favorites', 'menu')}</span>
            </button>
            <a className="menu__panel__action menu__panel__section_title__link"
              href="https://github.com/QwantResearch/qwantmaps/blob/master/contributing.md"
              rel="noopener noreferrer"
              target="_blank"
            >
              <i className="menu__panel__action__icon icon-zap" />
              <span>{_('How to contribute', 'menu')}</span>
            </a>
          </div>

          {menuItems.map(menuItem => <MenuItem key={menuItem.sectionName} menuItem={menuItem} />)}
        </div>
      </div>
    </div>, menuContainer.current)}
  </Fragment>;
};

export default Menu;
