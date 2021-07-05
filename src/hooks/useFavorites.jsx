import { useEffect, useState } from 'react';
import { listen, unListen } from 'src/libs/customEvents';

import { addToFavorites, removeFromFavorites, isInFavorites } from 'src/adapters/store';
import PoiStore from 'src/adapters/poi/poi_store';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(PoiStore.getAll());

  useEffect(() => {
    const updateFavState = listen('poi_favorite_state_changed', () => {
      setFavorites(PoiStore.getAll());
    });

    return () => {
      unListen(updateFavState);
    };
  });

  return { favorites, addToFavorites, removeFromFavorites, isInFavorites };
};
