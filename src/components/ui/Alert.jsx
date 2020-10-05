import React from 'react';
import cs from 'classnames';
import { string, oneOf, func, node, oneOfType } from 'prop-types';
import { CloseButton } from 'src/components/ui';

const AlertIcon = {
  success: 'check-circle',
  info: 'icon_info',
  warning: 'alert-triangle',
  error: 'alert-octagon',
};

const Alert = ({
  className = '',
  title,
  description,
  type = 'warning',
  onClose,
}) =>
  <div className={cs('alert', className)}>
    <span className="alert-title">
      <span>
        <i className={`alert-icon icon-${AlertIcon[type]} icon-${type}`}></i>
        <span role="alert">{title}</span>
      </span>
      <CloseButton onClick={onClose} position="topRight" />
    </span>
    <div className="alert-content">
      <span role="alert">{description}</span>
    </div>
  </div>
;

Alert.propTypes = {
  className: string,
  title: string.isRequired,
  description: oneOfType([string, node]).isRequired,
  type: oneOf(Object.keys(AlertIcon)),
  onClose: func.isRequired,
  closeButtonLabel: string.isRequired,
};

export default Alert;
