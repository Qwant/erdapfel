/* global _ */
import React, { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import OpeningHour from 'src/components/OpeningHour';

function showHour(day) {
  if (day.opening && day.opening.length > 0) {
    return day.opening.map((openingFragment, i) =>
      <p key={i}>{ openingFragment.beginning } - { openingFragment.end }</p>);
  }
  return _('Closed', 'hour block');
}

function showHours(displayHours) {
  const dayNumber = new Date().getDay();

  return <table>
    <tbody>
      {displayHours.map((day, i) =>
        <tr key={i} className={
          classnames({ 'currentDay': (i + 1) % 7 === dayNumber })
        }>
          <td className="day">{ day.dayName }</td>
          <td className="hours">{ showHour(day) }</td>
        </tr>)}
    </tbody>
  </table>;
}

const TimeTable = ({ title, schedule }) => {
  const [ isCollapsed, setCollapsed ] = useState(true);

  return <div className={classnames('timetable', { 'timetable--collapsed': isCollapsed })}>
    <div className="timetable-status" onClick={() => { setCollapsed(!isCollapsed); }}>
      <div className="timetable-status-text">{title}</div>
      <i className="icon-icon_chevron-down" />
    </div>
    <div className={classnames('timetable-table')}>
      {schedule.isTwentyFourSeven
        ? <OpeningHour schedule={schedule} />
        : showHours(schedule.displayHours)}
    </div>
  </div>;
};

TimeTable.propTypes = {
  title: PropTypes.node,
  opening: PropTypes.object,
};

export default TimeTable;
