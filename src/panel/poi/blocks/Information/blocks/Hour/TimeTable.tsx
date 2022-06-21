import React, { useState } from 'react';
import classnames from 'classnames';
import OpeningHour from 'src/components/OpeningHour';
import Chevron from 'src/components/ui/Chevron';
import { PoiHourBlockProps } from '.';

function showHour(day, closedText) {
  if (day.opening && day.opening.length > 0) {
    return day?.opening?.map((openingFragment, i) => (
      <p key={i}>
        {openingFragment.beginning} - {openingFragment.end}
      </p>
    ));
  }
  return closedText;
}

const Days = ({ days, closedText }) => {
  const dayNumber = new Date().getDay();

  return (
    <table>
      <tbody>
        {days.map((day, i) => (
          <tr key={i} className={classnames({ currentDay: (i + 1) % 7 === dayNumber })}>
            <td className="day u-firstCap">{day.dayName}</td>
            <td className="hours">{showHour(day, closedText)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export type PoiTimeTableProps = {
  title?: string;
  schedule?: any; // TODO: OsmSchedule type
  texts?: PoiHourBlockProps['texts'];
};

const TimeTable: React.FunctionComponent<PoiTimeTableProps> = ({ title, schedule, texts }) => {
  const [isCollapsed, setCollapsed] = useState(true);
  let header;
  let content;

  if (title) {
    header = title;
    content = schedule.isTwentyFourSeven ? (
      <OpeningHour schedule={schedule} texts={texts} />
    ) : (
      <Days days={schedule.displayHours} closedText={texts?.closed} />
    );
  } else {
    header = <OpeningHour schedule={schedule} texts={texts} />;
    if (!schedule.isTwentyFourSeven) {
      content = <Days days={schedule.displayHours} closedText={texts?.closed} />;
    }
  }

  const collapsable = !!content;
  return (
    <div
      className={classnames('timetable', {
        'timetable--collapsable': collapsable,
        'timetable--collapsed': isCollapsed,
      })}
    >
      <div
        className="timetable-status"
        onClick={() => {
          if (collapsable) {
            setCollapsed(!isCollapsed);
          }
        }}
      >
        <div className="timetable-status-text">{header}</div>
        {collapsable && <Chevron up={isCollapsed} />}
      </div>
      {collapsable && <div className={classnames('timetable-table')}>{content}</div>}
    </div>
  );
};

export default TimeTable;
