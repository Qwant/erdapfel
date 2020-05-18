import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const valueToColor = (colors, value) => {
  const nextIndex = colors.findIndex(({ min }) => value < min);
  return colors[(nextIndex === -1 ? colors.length : nextIndex) - 1].color;
};

const Meter = ({ value, colors, className }) =>
  <div className={classnames('meter', className)}>
    <div className="meter-valueBar" style={{
      width: `${value}%`,
      backgroundColor: valueToColor(colors, value),
    }} />
  </div>;

Meter.propTypes = {
  value: PropTypes.number.isRequired,
  colors: PropTypes.arrayOf(PropTypes.shape({
    min: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
  })).isRequired,
  className: PropTypes.string,
};

export default Meter;
