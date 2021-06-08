import React from 'react';
import cs from 'classnames';
import { string, oneOf, func, node, oneOfType } from 'prop-types';
import { CloseButton } from 'src/components/ui';

const NotificationIcon = {
  success: 'check-circle',
  info: 'icon_info',
  warning: 'alert-triangle',
  error: 'alert-octagon',
};

const Notification = ({
  className = '',
  title,
  description,
  type = 'warning',
  onClose,
  footer,
}) => (
  <div className={cs('notification', className)}>
    <span className="notification-title">
      <span>
        <i className={`notification-icon icon-${NotificationIcon[type]} icon-${type}`}></i>
        <span role="notification">{title}</span>
      </span>
      <CloseButton onClick={onClose} position="topRight" />
    </span>
    <div className="notification-content">
      <span role="notification">{description}</span>
    </div>
    {footer}
  </div>
);
Notification.propTypes = {
  className: string,
  title: string.isRequired,
  description: oneOfType([string, node]).isRequired,
  type: oneOf(Object.keys(NotificationIcon)),
  onClose: func.isRequired,
};

export default Notification;
