import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiItem from 'src/components/PoiItem';
import { useDevice } from 'src/hooks';

const PoiItems = ({ pois, selectPoi, highlightMarker }) => {
  const { isMobile } = useDevice();

  return (
    <ItemList hover className="category__panel__items">
      {pois.map(poi => (
        <Item
          key={poi.id}
          onClick={() => {
            selectPoi(poi);
          }}
          onMouseOver={() => {
            !isMobile && highlightMarker(poi, true);
          }}
          onMouseOut={() => {
            !isMobile && highlightMarker(poi, false);
          }}
        >
          <PoiItem poi={poi} withOpeningHours withImage inList />
        </Item>
      ))}
    </ItemList>
  );
};

export default PoiItems;
