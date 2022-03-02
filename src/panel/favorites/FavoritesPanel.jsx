/* globals _ */
import React, { useEffect } from 'react';
import Telemetry from 'src/libs/telemetry';
import Panel from 'src/components/ui/Panel';
import FavoriteItems from './FavoriteItems';
import { useFavorites, usePageTitle } from 'src/hooks';
import { fire } from 'src/libs/customEvents';

const FavoritesPanel = () => {
  const { favorites, removeFromFavorites } = useFavorites();

  usePageTitle(_('Favorite places', 'favorite panel'));

  useEffect(() => {
    Telemetry.add(Telemetry.FAVORITE_OPEN);
    fire('hide_history_prompt');
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
      renderHeader={
        <div className="favorite-header u-text--smallTitle">
          {favorites.length === 0
            ? _('Favorite places', 'favorite panel')
            : _('My favorites', 'favorite panel')}
        </div>
      }
      onClose={close}
      className="favorite_panel"
    >
      <FavoriteItems favorites={favorites} removeFavorite={removeFav} />
    </Panel>
  );
};

export default FavoritesPanel;
