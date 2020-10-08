import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Button = ({
  children, icon, variant = 'secondary', type = 'button',
  disabled, href, onClick, className, ...rest
}) => {
  const Tag = href ? 'a' : 'button';

  return <Tag
    type={type}
    disabled={disabled}
    className={classnames(
      'button',
      { [`button--${variant}`]: variant },
      { ['button--disabled']: disabled },
      className
    )}
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
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary']),
  type: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
