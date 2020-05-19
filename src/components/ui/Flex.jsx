import React from 'react';
import classnames from 'classnames';

const Flex = ({ children, spaceBetween, className }) =>
  <div className={classnames('flex', { 'flex--spaceBetween': spaceBetween }, className)}>
    {children}
  </div>;

export default Flex;
