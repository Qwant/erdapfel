/* global _ */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

const CloseButton = ({ className, position, onClick }) =>
  <button
    className={cx('closeButton', { [`closeButton--${position}`]: position }, className)}
    title={_('Close')}
    onClick={onClick}
  >
    <i className="icon-x" />
  </button>;

CloseButton.propTypes = {
  className: PropTypes.string,
  position: PropTypes.oneOf(['topRight']),
  onClick: PropTypes.func.isRequired,
};

export default CloseButton;
