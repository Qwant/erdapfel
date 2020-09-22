/* globals _ */
import React from 'react';
import Telemetry from 'src/libs/telemetry';
import Panel from 'src/components/ui/Panel';
import FavoriteItems from './FavoriteItems';
import Store from 'src/adapters/store';
import PoiStore from 'src/adapters/poi/poi_store';

export default class FavoritesPanel extends React.Component {
  state = {
    favoritePois: [],
    isReady: false,
  };

  componentDidMount() {
    Telemetry.add(Telemetry.FAVORITE_OPEN);
    this.store = new Store();
    this.loadData();
  }

  loadData = async () => {
    const favoritePois = await PoiStore.getAll();
    this.setState({
      favoritePois,
      isReady: true,
    });
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

    const { favoritePois } = this.state;

    const header = <div className="favorite-header u-text--smallTitle u-center">
      {favoritePois.length === 0
        ? _('Favorite places', 'favorite panel')
        : _('My favorites', 'favorite panel')}
    </div>;

    return <Panel
      resizable
      renderHeader={header}
      minimizedTitle={_('Show favorites', 'favorite panel')}
      onClose={this.close}
      className="favorite_panel"
    >
      <FavoriteItems favorites={favoritePois} removeFavorite={this.removeFav} />
    </Panel>;
  }
}
