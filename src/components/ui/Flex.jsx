import React, { forwardRef } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Flex = forwardRef(({
  children,
  inline,
  className,
  justifyContent,
  alignItems = 'center',
  ...rest
}, ref) =>
  <div
    className={classnames('flex', { 'flex--inline': inline }, className)}
    ref={ref}
    style={{
      justifyContent,
      alignItems,
    }}
    {...rest}
  >
    {children}
  </div>
);

Flex.displayName = 'Flex';
Flex.propTypes = {
  justifyContent: PropTypes.oneOf(['center', 'space-between']),
  alignItems: PropTypes.oneOf(['center']),
};

export default Flex;
