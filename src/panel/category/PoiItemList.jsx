import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiItem from 'src/components/PoiItem';

const PoiItems = ({
  pois,
  selectPoi,
  highlightMarker,
}) =>
  <ItemList hover className="category__panel__items">
    {pois.map(poi => <Item key={poi.id}
      onClick={() => { selectPoi(poi); }}
      onMouseOver={() => { highlightMarker(poi, true); }}
      onMouseOut={() => { highlightMarker(poi, false); }}
    >
      <PoiItem poi={poi} withOpeningHours withImage inList />
    </Item>)}
  </ItemList>;

export default PoiItems;
