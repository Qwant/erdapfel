/* global _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import classnames from 'classnames';

function showHour(day) {
  if (day.opening && day.opening.length > 0) {
    return day.opening.map(openingFragment =>
      <p>{ openingFragment.beginning } - { openingFragment.end }</p>);
  }
  return _('Closed', 'hour block');
}

function showHours(displayHours) {
  const dayNumber = new Date().getDay();

  return displayHours.map((day, i) => 
    <tr key={i} className={ classnames({ 'poi_panel__info__hours--current': (i + 1) % 7 === dayNumber}) }>
      <td className="day">{ day.dayName }</td>
      <td className="hours">{ showHour(day) }</td>
    </tr>);
}

const HourBlock = ({
  block,
  options,
  asString,
}) => {
  const opening = new OsmSchedule(block, options.messages);
  if (!opening.days) {
    return '';
  }
  if (asString) {
    Telemetry.add(Telemetry.POI_HOUR_EXTEND);
    if (opening.isTwentyFourSeven) {
      return <div className="poi_panel__info__hours__status__text poi_panel__info__hours__24_7">
        { _('Open 24/7', 'hour block') }
        <div className="poi_panel__info__hour__circle" style={{ background: opening.status.color }}></div>
      </div>
    }
    const text = `${_(opening.status.msg)} ${opening.nextTransition} - ` +
      _('until {nextTransitionTime}', 'hour panel', {nextTransitionTime : opening.nextTransition});
    return <span className="poi_panel__info__hours__status__text">{ text }
      <div className="poi_panel__info__hour__circle" style={{ background: opening.status.color }}></div>
    </span>;
  }

  if (opening.isTwentyFourSeven) {
    return <div className="poi_panel__info__hours__status__text poi_panel__info__hours__24_7">
        { _('Open 24/7', 'hour block') }
        <div className="poi_panel__info__hour__circle"
          style={{ background: opening.status.color }} />
      </div>;
  }
  return <div className="poi_panel__info">
    <table className="poi_panel__info__hours__table">
      { showHours(opening.displayHours) }
    </table>
  </div>;
};

export default HourBlock;
