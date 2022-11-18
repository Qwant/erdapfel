import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiItem from 'src/components/PoiItem';
import { useDevice } from 'src/hooks';
import cx from 'classnames';

const PoiItems = ({ pois, selectPoi, highlightMarker, source }) => {
  const { isMobile } = useDevice();
  return (
    <ItemList
      className={cx('category__panel__items', `category__panel__items--offset-${source}`)}
      hover
    >
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
