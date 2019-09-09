/* globals _ */
import React from 'react';
import { menu as menuItems } from '../../config/constants.yml';
import nconf from '@qwant/nconf-getter';
import MenuItem from './menu/MenuItem';
import MenuButton from './menu/MenuButton';
import MasqStatus from './menu/MasqStatus';
import Store from '../adapters/store';
import SearchInput from '../ui_components/search_input';
import classnames from 'classnames';

const isDirectionActive = nconf.get().direction.enabled;
const isMasqEnabled = nconf.get().masq.enabled;

export default class Menu extends React.Component {
  state = {
    isOpen: false,
    isInitialized: isMasqEnabled ? false : true,
    masqUser: null,
  };

  componentDidMount = () => {
    if (isMasqEnabled) {
      this.store = new Store();
      this.store.onToggleStore(this.onStoreChange);
      this.onStoreChange();
    }
  }

  onStoreChange = () => {
    this.store.isLoggedIn().then(isLoggedIn => {
      if (!isLoggedIn) {
        this.setState({
          isInitialized: true,
          masqUser: null,
        });
      } else {
        this.store.getUserInfo().then(masqUser => {
          this.setState({
            isInitialized: true,
            masqUser,
          });
        });
      }
    });
  }

  open = () => {
    this.setState({ isOpen: true });
  }

  close = () => {
    this.setState({ isOpen: false });
  }

  search = () => {
    this.close();
    window.app.navigateTo('/');
    SearchInput.select();
  }

  openFavorite = () => {
    this.close();
    window.app.navigateTo('/favs');
  }

  openDirection = () => {
    this.close();
    window.app.navigateTo('/routes/');
  }

  render() {
    if (!this.state.isInitialized) {
      return null;
    }

    return <div>
      <div
        className={classnames('menu__overlay', {
          'menu__overlay--active': this.state.isOpen,
          'menu__overlay--fade_active': this.state.isOpen,
        })}
        onClick={this.close}
      />

      <MenuButton masqUser={this.state.masqUser} onClick={this.open} />

      <div className="menu">
        <div className={classnames('menu__panel', { 'menu__panel--active': this.state.isOpen })}>
          <div className="menu__panel__top">
            <h2 className="menu__panel__top__title">
              <i className="menu__panel__top__icon icon-map" />
              <span>Qwant Maps</span>
              <i className="icon-x menu__panel__top__close" onClick={this.close} />
            </h2>
            <MasqStatus user={this.state.masqUser} store={this.store} />
          </div>

          <div className="menu__panel__items_container">
            <div className="menu__panel__section menu__panel__section-internal">
              <button className="menu__panel__action" onClick={this.search}>
                <img
                  className="menu__panel__action__icon"
                  src="./statics/images/magnifier.svg" alt=""
                />
                <span>{_('Search', 'menu')}</span>
              </button>
              {isDirectionActive &&
                <button className="menu__panel__action" onClick={this.openDirection}>
                  <i className="menu__panel__action__icon icon-corner-up-right" />
                  <span>{_('Directions', 'menu')}</span>
                </button>
              }
              <button className="menu__panel__action" onClick={this.openFavorite}>
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
      </div>
    </div>;
  }
}
