/* globals _ */
import React, { useState, useEffect } from 'react';
import Telemetry from 'src/libs/telemetry';
import Panel from 'src/components/ui/Panel';
import FavoriteItems from './FavoriteItems';
import { removeFromFavorites } from 'src/adapters/store';
import PoiStore from 'src/adapters/poi/poi_store';

const FavoritesPanel = () => {
  const [favs, setFavs] = useState(PoiStore.getAll());

  useEffect(() => {
    Telemetry.add(Telemetry.FAVORITE_OPEN);
  }, []);

  const removeFav = poi => {
    Telemetry.add(Telemetry.FAVORITE_DELETE);
    removeFromFavorites(poi);
    // @TODO: manage favorites as an upstream state to avoid this duplication
    // It could be a context or a dedicated hook.
    setFavs(favs.filter(favorite => favorite !== poi));
  };

  const close = () => {
    Telemetry.add(Telemetry.FAVORITE_CLOSE);
    window.app.navigateTo('/');
  };

  return (
    <Panel
      resizable
      renderHeader={
        <div className="favorite-header u-text--smallTitle u-center">
          {favs.length === 0
            ? _('Favorite places', 'favorite panel')
            : _('My favorites', 'favorite panel')}
        </div>
      }
      minimizedTitle={_('Show favorites', 'favorite panel')}
      onClose={close}
      className="favorite_panel"
    >
      <FavoriteItems favorites={favs} removeFavorite={removeFav} />
    </Panel>
  );
};

export default FavoritesPanel;
