import React from 'react';
import classnames from 'classnames';

const Item = ({ children, className = '', ...rest }) =>
  <div className={classnames('itemList-item', className)} {...rest}>
    {children}
  </div>;

const ItemList = ({ children, hover, className = '' }) =>
  <div className={classnames('itemList', { 'itemList--hover': hover }, className)}>
    {children}
  </div>;

export { ItemList, Item };
