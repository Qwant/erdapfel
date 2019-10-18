/* global _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import constants from 'config/constants.yml';

let memoizedMessages = null;
const getMessages = () => {
  memoizedMessages = memoizedMessages ||
    constants.pois.find(poiConfig => poiConfig.apiName === 'opening_hours').options.messages;
  return memoizedMessages;
};

const OpeningHour = ({ poi }) => {
  const openingBlock = poi.blocksByType && poi.blocksByType.opening_hours;
  if (!openingBlock) {
    return null;
  }

  const schedule = new OsmSchedule(openingBlock, getMessages());
  const { isTwentyFourSeven, status, nextTransition } = schedule;
  if (isTwentyFourSeven) {
    return <div className="openingHour poi_panel__info__hours__24_7">
      {_('Open 24/7', 'hour block')}
      {' '}
      <div className="openingHour-circle" style={{ background: status.color }} />
    </div>;
  }

  return <div className="openingHour">
    {_(status.msg)}
    {nextTransition &&
      ` - ${_('until {nextTransitionTime}', 'hour panel', { nextTransitionTime: nextTransition })}`
    }
    {' '}
    <div className="openingHour-circle" style={{ background: status.color }} />
  </div>;
};

export default OpeningHour;
