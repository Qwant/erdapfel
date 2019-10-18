/* globals _ */
import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import FavoritePoi from './FavoritePoi';

const FavoriteItems = ({ favorites = [], removeFavorite }) => {
  if (favorites.length === 0) {
    return <div
      className="favorite_panel__container__empty"
      dangerouslySetInnerHTML={{
        __html: _('You have no favorite places. <br>You can add one by clicking on a place'),
      }}
    />;
  }

  return <ItemList className="favorite_panel__items">
    {favorites.map(favorite => <Item key={favorite.id}>
      <FavoritePoi poi={favorite} removeFavorite={removeFavorite} />
    </Item>)}
  </ItemList>;
};

export default FavoriteItems;
