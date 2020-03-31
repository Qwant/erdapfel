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

const Days = ({ days }) => {
  const dayNumber = new Date().getDay();

  return <table>
    <tbody>
      {days.map((day, i) =>
        <tr key={i} className={
          classnames({ 'currentDay': (i + 1) % 7 === dayNumber })
        }>
          <td className="day">{ day.dayName }</td>
          <td className="hours">{ showHour(day) }</td>
        </tr>)}
    </tbody>
  </table>;
};

const TimeTable = ({ title, schedule }) => {
  const [ isCollapsed, setCollapsed ] = useState(true);

  let header;
  let content;
  if (title) {
    header = title;
    content = schedule.isTwentyFourSeven
      ? <OpeningHour schedule={schedule} />
      : <Days days={schedule.displayHours} />;
  } else {
    header = <OpeningHour schedule={schedule} />;
    if (!schedule.isTwentyFourSeven) {
      content = <Days days={schedule.displayHours} />;
    }
  }

  const collapsable = !!content;
  return <div className={classnames('timetable', {
    'timetable--collapsable': collapsable,
    'timetable--collapsed': isCollapsed,
  })}>
    <div className="timetable-status" onClick={() => {
      if (collapsable) {
        setCollapsed(!isCollapsed);
      }
    }}>
      <div className="timetable-status-text">{header}</div>
      {collapsable && <i className="icon-icon_chevron-down" />}
    </div>
    {collapsable && <div className={classnames('timetable-table')}>
      {content}
    </div>}
  </div>;
};

TimeTable.propTypes = {
  title: PropTypes.node,
  opening: PropTypes.object,
};

export default TimeTable;
