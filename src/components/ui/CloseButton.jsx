/* global _ */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { IconCloseCircle } from 'src/components/ui/icons';

const CloseButton = ({ className, position, onClick, circle }) =>
  <button
    className={cx('closeButton', { [`closeButton--${position}`]: position }, className)}
    title={_('Close')}
    onClick={onClick}
  >
    {circle ? <IconCloseCircle width={20} /> : <i className="icon-x" />}
  </button>;

CloseButton.propTypes = {
  className: PropTypes.string,
  position: PropTypes.oneOf(['topRight']),
  onClick: PropTypes.func.isRequired,
};

export default CloseButton;
