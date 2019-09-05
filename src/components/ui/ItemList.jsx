import React from 'react';
import classnames from 'classnames';

const Item = ({ children, className = '', ...rest }) =>
  <div className={classnames('itemList-item', className)} {...rest}>
    {children}
  </div>;

const ItemList = ({ children, className = '' }) =>
  <div className={classnames('itemList', className)}>
    {children}
  </div>;

export { ItemList, Item };
