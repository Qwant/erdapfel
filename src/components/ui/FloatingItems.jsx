import React from 'react';
import classNames from 'classnames';

const FloatingItems = ({ className, items }) =>
  <div className={classNames('floatingItems', className)}>
    {items}
  </div>
;

export default FloatingItems;
