import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { IconCloseCircle, IconClose } from '@qwant/qwant-ponents';
import { useI18n } from 'src/hooks';

const CloseButton = ({ className, position, onClick, onMouseDown, circle, variant, title }) => {
  const { _ } = useI18n();

  return (
    <button
      className={cx(
        'closeButton',
        { [`closeButton--${position}`]: position, [`closeButton--${variant}`]: variant },
        className
      )}
      title={title || _('Close')}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {circle ? <IconCloseCircle size={20} /> : <IconClose size={variant === 'small' ? 20 : 24} />}
    </button>
  );
};

CloseButton.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  position: PropTypes.oneOf(['topRight']),
  onClick: PropTypes.func,
  onMouseDown: PropTypes.func,
  variant: PropTypes.oneOf(['small']),
};

export default CloseButton;
