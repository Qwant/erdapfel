import React from 'react';
import classnames from 'classnames';

const Button = ({
  children, icon, variant, className = '', type = 'button',
  href, onClick, ...rest
}) => {
  const Tag = href ? 'a' : 'button';

  return <Tag
    type={type}
    className={classnames('button', { [`button--${variant}`]: variant }, className)}
    onClick={onClick}
    href={href}
    {...rest}
  >
    {icon && <span className={`button-icon icon-${icon}`} />}
    {children && <div className="button-content">{children}</div>}
  </Tag>;
};

export default Button;
