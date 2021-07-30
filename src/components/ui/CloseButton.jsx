/* global _ */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { IconCloseCircle, IconClose } from 'src/components/ui/icons';

const CloseButton = ({ className, position, onClick, onMouseDown, circle, variant }) => (
  <button
    className={cx(
      'closeButton',
      { [`closeButton--${position}`]: position, [`closeButton--${variant}`]: variant },
      className
    )}
    title={_('Close')}
    onClick={onClick}
    onMouseDown={onMouseDown}
  >
    {circle ? (
      <IconCloseCircle width={20} />
    ) : (
      <IconClose width={variant === 'small' ? 20 : 24} fill="currentColor" />
    )}
  </button>
);

CloseButton.propTypes = {
  className: PropTypes.string,
  position: PropTypes.oneOf(['topRight']),
  onClick: PropTypes.func,
  onMouseDown: PropTypes.func,
  variant: PropTypes.oneOf(['small']),
};

export default CloseButton;
