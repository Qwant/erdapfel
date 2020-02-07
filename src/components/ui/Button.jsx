import React from 'react';
import classnames from 'classnames';

const Button = ({ children, icon, variant, className = '', type = 'button', onClick, ...rest }) =>
  <button
    type={type}
    className={classnames('button', { [`button--${variant}`]: variant }, className)}
    onClick={onClick}
    {...rest}
  >
    {icon && <span className={`button-icon icon-${icon}`} />}
    <div className="button-content">{children}</div>
  </button>;

export default Button;
