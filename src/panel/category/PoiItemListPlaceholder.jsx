import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PlaceholderText from 'src/components/ui/PlaceholderText';

const PoiItemPlaceholder = () =>
  <div className="poiItem">
    <div>
      <PlaceholderText length={25} tagName="h3" className="u-text--smallTitle"/>
      <PlaceholderText length={15} tagName="p" className="u-text--subtitle" />
      <PlaceholderText length={25} tagName="p" className="poiItem-address" />
      <div className="poiItem-reviews"><PlaceholderText length={15} /></div>
      <div className="openingHour"><PlaceholderText length={10} /></div>
    </div>
    <div className="poiItem-right">
      <div className="poiTitleImage u-placeholder" />
    </div>
  </div>;

const PoiItemListPlaceholder = ({ nbItems = 6 }) =>
  <ItemList className="category__panel__items category__panel__items--placeholder">
    {Array.from({ length: nbItems }).map((_item, index ) => <Item key={index}>
      <PoiItemPlaceholder />
    </Item>)}
  </ItemList>;

export default PoiItemListPlaceholder;
