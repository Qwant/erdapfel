/* global _ */
import React from 'react';
import EventTitleImage from 'src/panel/event/EventTitleImage';

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
      dates_string = _(
        'on {date}',
        'events',
        {
          date: Intl.DateTimeFormat(
            'fr',
            { day: 'numeric', month: 'short', year: 'numeric' }
          ).format(date_start),
        }
      );
    } else {
      dates_string = _(
        'from {date1} to {date2}',
        'events',
        {
          date1: Intl.DateTimeFormat(
            'fr',
            { day: 'numeric', month: 'short', year: 'numeric' }
          ).format(date_start),
          date2: Intl.DateTimeFormat(
            'fr',
            { day: 'numeric', month: 'short', year: 'numeric' }
          ).format(date_end),
        }
      );
    }
  }

  return <div className="event__panel__item">
    <EventTitleImage poi={poi} eventName={eventName}/>
    <h3 className="event__panel__name">{poi.getInputValue()}</h3>
    <div className="event__panel__type">{eventName}</div>
    {address.label && <p className="event__panel__address">{address.label}</p>}
    {dates_string && <div className="event__panel__date">
      <span className="icon-calendar"></span>
      {dates_string}
    </div>}
  </div>;
};

export default PoiEventItem;
