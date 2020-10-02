/* global _ */
import React from 'react';
import cx from 'classnames';

const CloseButton = ({ className, onClick }) =>
  <button
    className={cx('closeButton', className)}
    title={_('Close')}
    onClick={onClick}
  >
    <i className="icon-x" />
  </button>;

export default CloseButton;
