/* globals _ */
import React from 'react';
import Telemetry from 'src/libs/telemetry';
import Panel from 'src/components/ui/Panel';
import FavoriteItems from './FavoriteItems';
import FavoriteMasqFooter from './FavoriteMasqFooter';
import { version } from 'config/constants.yml';
import { open as openMasqOnboarding } from 'src/modals/MasqOnboardingModal';
import Store from 'src/adapters/store';
import PoiStore from 'src/adapters/poi/poi_store';
import nconf from '@qwant/nconf-getter';

const isMasqEnabled = nconf.get().masq.enabled;

export default class FavoritesPanel extends React.Component {
  state = {
    isLoggedIn: false,
    favoritePois: [],
    isReady: false,
    masqFooterClosed: localStorage.getItem(`qmaps_v${version}_favorite_masq_footer`) === 'false',
  };

  componentDidMount() {
    Telemetry.add(Telemetry.FAVORITE_OPEN);
    this.store = new Store();
    this.store.onToggleStore(this.loadData);
    this.loadData();
  }

  loadData = async () => {
    const isLoggedIn = await this.store.isLoggedIn();
    const favoritePois = await PoiStore.getAll();
    this.setState({
      isLoggedIn,
      favoritePois,
      isReady: true,
    });
  }

  openMasq = () => {
    Telemetry.add(Telemetry.MASQ_BANNER_CLICK);
    openMasqOnboarding();
  }

  closeMasqFooter = () => {
    Telemetry.add(Telemetry.MASQ_BANNER_CLOSE);
    localStorage.setItem(`qmaps_v${version}_favorite_masq_footer`, false);
    this.setState({ masqFooterClosed: true });
  }

  removeFav = async poi => {
    Telemetry.add(Telemetry.FAVORITE_DELETE);
    this.setState(prevState => ({
      favoritePois: prevState.favoritePois.filter(favorite => favorite !== poi),
    }));
    await this.store.del(poi);
  };

  close = () => {
    Telemetry.add(Telemetry.FAVORITE_CLOSE);
    window.app.navigateTo('/');
  };

  render() {
    if (!this.state.isReady) {
      return null;
    }

    const { favoritePois, isLoggedIn, masqFooterClosed } = this.state;
    const displayMasqFooter = isMasqEnabled && !isLoggedIn && !masqFooterClosed;

    const header = <React.Fragment>
      {favoritePois.length === 0
        ? _('Favorite places', 'favorite panel')
        : _('My favorites', 'favorite panel')}
      {isLoggedIn && <div className="icon-masq_dark favorite_panel__masq_icon" />}
    </React.Fragment>;

    return <Panel
      resizable
      title={header}
      minimizedTitle={_('Show favorites', 'favorite panel')}
      close={this.close}
      className="favorite_panel"
    >
      <FavoriteItems favorites={favoritePois} removeFavorite={this.removeFav} />
      {displayMasqFooter && <FavoriteMasqFooter
        onOpenMasq={this.openMasq}
        onClose={this.closeMasqFooter}
      />}
    </Panel>;
  }
}
