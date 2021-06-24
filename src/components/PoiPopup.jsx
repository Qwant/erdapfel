import React from 'react';
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
      <PoiItem poi={poi} withOpeningHours withImage inList />
    </div>
  );
};

export default PoiPopup;
