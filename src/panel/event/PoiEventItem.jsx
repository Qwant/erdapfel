import React from 'react';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';

const PoiEventItem = ({ poi, eventName }) => {
  const address = poi.address || {};

  const blocks = poi.blocks;
  const dates_block = blocks.find(block => block.type === 'event_opening_dates') || {};
  let date_start, date_end, dates_string;

  if (dates_block) {
    if (dates_block.date_start) {
      date_start = new Date(dates_block.date_start);
    }
    if (dates_block.date_end) {
      date_end = new Date(dates_block.date_end);
    }
    if (
      date_start.getUTCFullYear() === date_end.getUTCFullYear()
      && date_start.getUTCMonth() === date_end.getUTCMonth()
      && date_start.getUTCDate() === date_end.getUTCDate()
    ) {
      dates_string = `Le ${date_start.getUTCFullYear() + ' ' + date_start.getUTCMonth() + ' ' + date_start.getUTCDate()}`;
    } else {
      dates_string = `Du ${date_start.getUTCFullYear() + ' ' + date_start.getUTCMonth() + ' ' + date_start.getUTCDate()} au ${date_end.getUTCFullYear() + ' ' + date_end.getUTCMonth() + ' ' + date_end.getUTCDate()}`;
    }
  }

  return <div className="event__panel__item">
    <PoiTitleImage poi={poi} />
    <h3 className="event__panel__name">{poi.getInputValue()}</h3>
    <div className="event__panel__type">{eventName}</div>
    {address.label && <p className="event__panel__address">{address.label}</p>}
    {dates_string && <div className="event__panel__date">{dates_string}</div>}
  </div>;
};

export default PoiEventItem;
