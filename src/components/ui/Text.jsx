import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Flex from './Flex';

const Text = ({ children, level, inline, icon, className, ...rest }) => {
  let TagName;
  const props = { ...rest };
  if (icon) {
    TagName = Flex;
    props.inline = inline;
    props.alignCenter = true;
  } else {
    TagName = inline ? 'span' : 'div';
  }
  return <TagName
    className={classnames({ [`u-text--${level}`]: level }, className)}
    {...props}
  >
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
