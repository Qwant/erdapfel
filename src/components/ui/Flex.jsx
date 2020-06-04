import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Flex = ({ children, inline, className,
  justifyContent,
  alignItems = 'center',
}) => {
  const style = { justifyContent, alignItems };
  return <div
    style={style}
    className={classnames('flex', { 'flex--inline': inline }, className)}>
    {children}
  </div>;
};

Flex.propTypes = {
  justifyContent: PropTypes.oneOf(['space-between']),
  alignItems: PropTypes.oneOf(['center']),
};

export default Flex;
