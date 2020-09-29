import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import PoiItem from 'src/components/PoiItem';
import { sources } from '../../../config/constants.yml';

const PoiItems = ({
  pois,
  selectPoi,
  highlightMarker,
  dataSource,
}) =>
  <div>
    <ItemList hover className="category__panel__items">
      {pois.map(poi => <Item key={poi.id}
        onClick={() => { selectPoi(poi); }}
        onMouseOver={() => { highlightMarker(poi, true); }}
        onMouseOut={() => { highlightMarker(poi, false); }}
      >
        <PoiItem poi={poi} withOpeningHours withImage inList />
      </Item>)}
    </ItemList>
    {dataSource === sources.pagesjaunes &&
    <div className="category__panel__pj">
      {_('Results in partnership with PagesJaunes', 'categories')}
    </div>}
  </div>;

export default PoiItems;
