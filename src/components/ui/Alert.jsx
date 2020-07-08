import React from 'react';
import cs from 'classnames';
import { string, oneOf, func } from 'prop-types';

const AlertIcon = {
  success: 'check-circle',
  info: 'icon_info',
  warning: 'alert-triangle',
  error: 'alert-octagon',
};

const Alert = ({ className = '', title, type = 'warning', onClose, closeButtonLabel }) =>
  <div className={cs('alert', { [`alert--${type}`]: type }, className)}>
    <div className="alert-content">
      <i className={`alert-icon icon-${AlertIcon[type]}`}></i>
      <span role="alert">{title}</span>
      <button
        className={'closeBtn'}
        onClick={onClose}
        aria-label={closeButtonLabel}
      >
        <i className="icon-x" />
      </button>
    </div>
  </div>
;

Alert.propTypes = {
  className: string,
  title: string.isRequired,
  type: oneOf(Object.keys(AlertIcon)),
  onClose: func.isRequired,
  closeButtonLabel: string.isRequired,
};

export default Alert;
