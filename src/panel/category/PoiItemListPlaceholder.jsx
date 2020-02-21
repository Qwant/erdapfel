import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PlaceholderText from 'src/components/ui/PlaceholderText';

const PoiItemPlaceholder = () =>
  <div className="category__panel__item">
    <div className="poiTitleImage u-placeholder" />
    <PlaceholderText length={25} tagName="h3" className="category__panel__name"/>
    <PlaceholderText length={15} tagName="p" className="category__panel__type" />
    <PlaceholderText length={25} tagName="p" className="category__panel__address" />
    <div className="openingHour"><PlaceholderText length={15} /></div>
  </div>;

const PoiItemListPlaceholder = ({ nbItems = 6 }) =>
  <ItemList className="category__panel__items category__panel__items--placeholder">
    {Array.from({ length: nbItems }).map((_item, index ) => <Item key={index}>
      <PoiItemPlaceholder />
    </Item>)}
  </ItemList>;

export default PoiItemListPlaceholder;
