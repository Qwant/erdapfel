import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Button = ({
  children, icon, variant = 'outline', type = 'button',
  href, onClick, className, ...rest
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

Button.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.string,
  variant: PropTypes.oneOf(['outline', 'primary', 'noBorder']),
  type: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
