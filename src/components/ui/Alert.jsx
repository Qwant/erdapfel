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
  footer,
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
    { footer }
  </div>
;

Alert.propTypes = {
  className: string,
  title: string.isRequired,
  description: oneOfType([string, node]).isRequired,
  type: oneOf(Object.keys(AlertIcon)),
  onClose: func.isRequired,
};

export default Alert;
