import React from 'react';
import classnames from 'classnames';

const ServicePanelAction = ({ variant, label, onClick, icon, iconStyle, className }) =>
  <button
    type="button"
    onClick={onClick}
    className={classnames('mainActionButton', {
      [`mainActionButton--${variant}`]: variant,
    }, className)}
  >
    <div className={`mainActionButton-icon icon-${icon}`} style={iconStyle}/>
    <div className="mainActionButton-label">{label}</div>
  </button>;

export default ServicePanelAction;
