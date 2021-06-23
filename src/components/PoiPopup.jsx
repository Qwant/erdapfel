import React from 'react';
import Address from 'src/components/ui/Address';
import PoiItem from './PoiItem';
import { fire } from 'src/libs/customEvents';

const PoiPopup = ({ poi }) => {
  return (
    <div
      className="poi_popup"
      onMouseEnter={() => {
        fire('stop_close_popup_timeout');
      }}
      onMouseLeave={() => {
        fire('close_popup');
      }}
    >
      <PoiItem poi={poi} className="poi-panel-poiItem" withAlternativeName withOpeningHours />
      {poi.address && <Address address={poi.address} inline omitCountry />}
    </div>
  );
};

export default PoiPopup;
