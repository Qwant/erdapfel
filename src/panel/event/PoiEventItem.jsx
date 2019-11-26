import React from 'react';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';

const PoiEventItem = ({ poi, eventName }) => {
  const address = poi.address || {};

  //const blocks = poi.blocks;
  //const dates_block = blocks.find(block => block.type === 'event_opening_dates') || {};
  //let date_start, date_end, dates_string;

  return <div className="event__panel__item">
    <PoiTitleImage poi={poi} />

    <h3 className="event__panel__name">{poi.getInputValue()}</h3>

    <div className="event__panel__type">{eventName}</div>

    {address.label && <p className="event__panel__address">{address.label}</p>}
  </div>;
};

export default PoiEventItem;
