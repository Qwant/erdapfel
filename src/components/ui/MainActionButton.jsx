import React from 'react';
import classnames from 'classnames';

const ServicePanelAction = ({ variant, label, onClick, icon, iconStyle, className, ...rest }) =>
  <button
    type="button"
    onClick={onClick}
    className={classnames('mainActionButton', {
      [`mainActionButton--${variant}`]: variant,
    }, className)}
    {...rest}
  >
    <div className={`mainActionButton-icon icon-${icon}`} style={iconStyle}/>
    <div className="mainActionButton-label">{capitalizeFirst(label)}</div>
  </button>;

export default ServicePanelAction;
