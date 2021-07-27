/* globals _ */
import React, { useEffect } from 'react';
import Telemetry from 'src/libs/telemetry';
import Panel from 'src/components/ui/Panel';
import FavoriteItems from './FavoriteItems';
import { useFavorites, usePageTitle } from 'src/hooks';

const FavoritesPanel = () => {
  const { favorites, removeFromFavorites } = useFavorites();

  usePageTitle(_('Favorite places', 'favorite panel'));

  useEffect(() => {
    Telemetry.add(Telemetry.FAVORITE_OPEN);
  }, []);

  const removeFav = poi => {
    Telemetry.add(Telemetry.FAVORITE_DELETE);
    removeFromFavorites(poi);
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
          {favorites.length === 0
            ? _('Favorite places', 'favorite panel')
            : _('My favorites', 'favorite panel')}
        </div>
      }
      minimizedTitle={_('Show favorites', 'favorite panel')}
      onClose={close}
      className="favorite_panel"
    >
      <FavoriteItems favorites={favorites} removeFavorite={removeFav} />
    </Panel>
  );
};

export default FavoritesPanel;
