/* global _ */
import React from 'react';
import cx from 'classnames';

const CloseButton = ({ className, position, onClick }) =>
  <button
    className={cx('closeButton', { [`closeButton--${position}`]: position }, className)}
    title={_('Close')}
    onClick={onClick}
  >
    <i className="icon-x" />
  </button>;

export default CloseButton;
