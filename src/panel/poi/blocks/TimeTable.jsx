/* global _ */
import React, { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

function showHour(day) {
  if (day.opening && day.opening.length > 0) {
    return day.opening.map((openingFragment, i) =>
      <p key={i}>{ openingFragment.beginning } - { openingFragment.end }</p>);
  }
  return _('Closed', 'hour block');
}

function showHours(displayHours) {
  const dayNumber = new Date().getDay();

  return <tbody>
    {displayHours.map((day, i) =>
      <tr key={i} className={
        classnames({ 'currentDay': (i + 1) % 7 === dayNumber })
      }>
        <td className="day">{ day.dayName }</td>
        <td className="hours">{ showHour(day) }</td>
      </tr>)}
  </tbody>;
}

const TimeTable = ({ title, schedule }) => {
  // TODO: use OpeningHour instead (careful! OsmSchedule initialization happens there as well!)
  if (schedule.isTwentyFourSeven) {
    return <div
      className="timetable timetable-status poi_panel__info__hours__24_7">
      { _('Open 24/7', 'hour block') }
      <div className="poi_panel__info__hour__circle"
        style={{ background: schedule.status.color }}
      />
    </div>;
  }

  const [ isCollapsed, setCollapsed ] = useState(true);

  return <div className={classnames('timetable', { 'timetable--collapsed': isCollapsed })}>
    <div className="timetable-status" onClick={() => { setCollapsed(!isCollapsed); }}>
      <div className="timetable-status-text">{title}</div>
      <i className="icon-icon_chevron-down" />
    </div>
    <div className={classnames('timetable-table')}>
      <table>
        { showHours(schedule.displayHours) }
      </table>
    </div>
  </div>;
};

TimeTable.propTypes = {
  title: PropTypes.node,
  opening: PropTypes.object,
};

export default TimeTable;
