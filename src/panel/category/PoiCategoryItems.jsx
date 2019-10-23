/* globals _ */
import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiCategoryItem from './PoiCategoryItem';

const PoiCategoryItems = ({ pois, selectPoi, highlightMarker, onShowPhoneNumber }) =>
  <ItemList className="category__panel__items">
    {pois.map(poi => <Item key={poi.id}
      onClick={() => { selectPoi(poi); }}
      onMouseOver={() => { highlightMarker(poi, true); }}
      onMouseOut={() => { highlightMarker(poi, false); }}
    >
      <PoiCategoryItem poi={poi} onShowPhoneNumber={onShowPhoneNumber} />
    </Item>)}
  </ItemList>;

export default PoiCategoryItems;
