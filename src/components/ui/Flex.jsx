import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Flex = ({
  style,
  children,
  inline,
  className,
  justifyContent,
  alignItems = 'center',
}) => {
  const flexStyle = { justifyContent, alignItems, ...style };
  return <div
    style={flexStyle}
    className={classnames('flex', { 'flex--inline': inline }, className)}>
    {children}
  </div>;
};

Flex.propTypes = {
  justifyContent: PropTypes.oneOf(['space-between']),
  alignItems: PropTypes.oneOf(['center']),
};

export default Flex;
