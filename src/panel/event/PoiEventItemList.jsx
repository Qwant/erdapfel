import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiEventItem from './PoiEventItem';

const PoiEventItems = ({
  pois,
  selectPoi,
  highlightMarker,
  eventName,
}) =>
  <ItemList className="event__panel__items">
    {pois.map(poi => <Item key={poi.id}
      onClick={() => { selectPoi(poi); }}
      onMouseOver={() => { highlightMarker(poi, true); }}
      onMouseOut={() => { highlightMarker(poi, false); }}
    >
      <PoiEventItem
        poi={poi}
        eventName={eventName}
      />
    </Item>)}
  </ItemList>;

export default PoiEventItems;
