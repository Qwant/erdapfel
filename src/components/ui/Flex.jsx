import React from 'react';
import classnames from 'classnames';

const Flex = ({ children, inline, spaceBetween, alignCenter, className }) =>
  <div className={classnames('flex', {
    'flex--spaceBetween': spaceBetween,
    'flex--alignCenter': alignCenter,
    'flex--inline': inline,
  }, className)}>
    {children}
  </div>;

export default Flex;
