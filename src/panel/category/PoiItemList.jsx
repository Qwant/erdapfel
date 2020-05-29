import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiItem from './PoiItem';

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
      <PoiItem poi={poi} />
    </Item>)}
  </ItemList>;

export default PoiItems;
