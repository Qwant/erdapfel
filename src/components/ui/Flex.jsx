import React, { forwardRef } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Flex = forwardRef(
  (
    {
      as = 'div',
      children,
      inline,
      className,
      justifyContent,
      alignItems = 'center',
      style,
      ...rest
    },
    ref
  ) => {
    const Tag = as;
    return (
      <Tag
        className={classnames('flex', { 'flex--inline': inline }, className)}
        ref={ref}
        style={{
          justifyContent,
          alignItems,
          ...style,
        }}
        {...rest}
      >
        {children}
      </Tag>
    );
  }
);

Flex.displayName = 'Flex';
Flex.propTypes = {
  justifyContent: PropTypes.oneOf(['center', 'space-between']),
  alignItems: PropTypes.oneOf(['center', 'flex-start', 'flex-end']),
};

export default Flex;
