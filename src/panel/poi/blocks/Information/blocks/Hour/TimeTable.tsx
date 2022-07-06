import React, { useState } from 'react';
import classnames from 'classnames';
import OpeningHour from 'src/components/OpeningHour';
import Chevron from 'src/components/ui/Chevron';
import { PoiHourBlockProps } from '.';

export type TimeTableDay = {
  dayofweek: number;
  local_date: string;
  status: string;
  opening_hours: TimeTableOpeningHour[];
};

export type TimeTableOpeningHour = {
  beginning: string;
  end: string;
};

export type TimeTableDisplayHour = {
  dayName: string;
  opening: TimeTableOpening[];
};

export type TimeTableOpening = {
  beginning: string;
  end: string;
};

export type TimeTableDays = {
  days: TimeTableDisplayHour[];
  closedText?: string;
};

function showHour(day: TimeTableDisplayHour, closedText = '') {
  if (day.opening && day.opening.length > 0) {
    return day?.opening?.map((openingFragment, i) => (
      <p key={i}>
        {openingFragment.beginning} - {openingFragment.end}
      </p>
    ));
  }
  return closedText;
}

const Days: React.FunctionComponent<TimeTableDays> = ({ days, closedText }) => {
  const dayNumber = new Date().getDay();

  return (
    <table>
      <tbody>
        {days?.map((day, i) => (
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
  schedule: {
    isTwentyFourSeven: boolean;
    days: TimeTableDay[];
    displayHours: TimeTableDisplayHour[];
    nextTransition: string;
    status: string;
  };
  texts?: PoiHourBlockProps['texts'];
};

const TimeTable: React.FunctionComponent<PoiTimeTableProps> = ({ title, schedule, texts }) => {
  const [isCollapsed, setCollapsed] = useState(true);
  let header: string | JSX.Element;
  let content: JSX.Element | null = null;

  if (title) {
    header = title;
    content = schedule.isTwentyFourSeven ? (
      <OpeningHour schedule={schedule} texts={texts} />
    ) : (
      <Days days={schedule?.displayHours} closedText={texts?.closed} />
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
