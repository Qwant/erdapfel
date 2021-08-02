import React from 'react';
import cs from 'classnames';
import { string, func, node, oneOfType } from 'prop-types';
import { CloseButton } from 'src/components/ui';
import { IconInformation } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const Notification = ({ className = '', title, description, onClose, footer }) => (
  <div className={cs('notification', className)}>
    <span className="notification-title">
      <span>
        <IconInformation className="u-mr-xs" fill={ACTION_BLUE_BASE} />
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
  onClose: func.isRequired,
};

export default Notification;
