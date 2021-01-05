import React from 'react';
import cx from 'classnames';

const FloatingButton = ({ title, onClick, icon, style, className }) =>
  <button
    title={title}
    className={cx('floatingButton', className)}
    onClick={onClick}
    style={style}
  >
    {typeof icon === 'string' && <i className={`icon-${icon}`} />}
    {typeof icon !== 'string' && icon}
  </button>
;

export default FloatingButton;
