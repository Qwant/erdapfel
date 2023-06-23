import React from 'react';
import cx from 'classnames';
import { stripTimeZone, getTimeFormatter } from 'src/libs/time';

export type RouteStartEndTimesProps = {
  start: string;
  end: string;
  className: string;
};

const RouteStartEndTimes: React.FunctionComponent<RouteStartEndTimesProps> = ({
  start,
  end,
  className,
}) => {
  if (!start || !end) {
    return null;
  }

  const dateFormatter = getTimeFormatter({ month: '2-digit', day: '2-digit' });
  const timeFormatter = getTimeFormatter({ hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cx('u-bold', className)}>
      {dateFormatter.format(new Date(stripTimeZone(start)))}
      {' - '}
      {timeFormatter.format(new Date(stripTimeZone(start)))}
      {' - '}
      {timeFormatter.format(new Date(stripTimeZone(end)))}
    </div>
  );
};

export default RouteStartEndTimes;
