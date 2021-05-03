import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { stripTimeZone, getTimeFormatter } from 'src/libs/time';

const RouteStartEndTimes = ({ start, end, className }) => {
  if (!start || !end) {
    return null;
  }

  const timeFormatter = getTimeFormatter({ hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cx('u-bold', className)}>
      {timeFormatter.format(new Date(stripTimeZone(start)))}
      {' - '}
      {timeFormatter.format(new Date(stripTimeZone(end)))}
    </div>
  );
};

RouteStartEndTimes.propTypes = {
  start: PropTypes.string,
  end: PropTypes.string,
};

export default RouteStartEndTimes;
