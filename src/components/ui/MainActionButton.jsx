import React from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';
import { Flex } from 'src/components/ui';

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
    {typeof icon === 'string' ? (
      <div className={`mainActionButton-icon icon-${icon}`} style={iconStyle} />
    ) : (
      <Flex className="mainActionButton-icon" justifyContent="center">
        {icon}
      </Flex>
    )}
    <div className="mainActionButton-label u-ellipsis">{capitalizeFirst(label)}</div>
  </button>
);

export default MainActionButton;
