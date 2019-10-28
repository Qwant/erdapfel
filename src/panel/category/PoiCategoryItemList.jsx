import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiCategoryItem from './PoiCategoryItem';

const PoiCategoryItems = ({
  pois,
  selectPoi,
  highlightMarker,
  unhighlightMarker,
  onShowPhoneNumber,
}) =>
  <ItemList className="category__panel__items">
    {pois.map(poi => <Item key={poi.id}
      onClick={() => { selectPoi(poi); }}
      onMouseOver={() => { highlightMarker(poi); }}
      onMouseOut={() => { unhighlightMarker(poi); }}
    >
      <PoiCategoryItem poi={poi} onShowPhoneNumber={onShowPhoneNumber} />
    </Item>)}
  </ItemList>;

export default PoiCategoryItems;
