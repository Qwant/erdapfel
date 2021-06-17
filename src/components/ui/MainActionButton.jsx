import React from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';

const MainActionButton = ({ variant, label, onClick, icon, iconStyle, className, ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className={classnames(
      'mainActionButton',
      {
        [`mainActionButton--${variant}`]: variant,
      },
      className
    )}
    {...rest}
  >
    <div className={`mainActionButton-icon icon-${icon}`} style={iconStyle} />
    <div className="mainActionButton-label u-ellipsis">{capitalizeFirst(label)}</div>
  </button>
);

export default MainActionButton;
