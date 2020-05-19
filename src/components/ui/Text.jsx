import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Text = ({ children, level, inline, icon, className }) => {
  const TagName = inline ? 'span' : 'div';
  return <TagName className={classnames({ [`u-text--${level}`]: level }, className)}>
    {icon && <i className={`u-mr-4 icon-${icon}`} />}
    {children}
  </TagName>;
};

Text.propTypes = {
  level: PropTypes.oneOf(['caption', 'smallTitle', 'subtitle']),
  icon: PropTypes.string,
  children: PropTypes.node,
  inline: PropTypes.bool,
  className: PropTypes.string,
};

export default Text;
