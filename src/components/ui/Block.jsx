import React from 'react';
import classNames from 'classnames';

const Block = ({ icon, title, children, className }) =>
  <div className={classNames('block', className)}>
    <i className={`block-icon icon-${icon}`}/>
    <div className="block-content">
      <div className="u-firstCap u-text--subtitle u-mb-2">{title}</div>
      {children}
    </div>
  </div>;


export default Block;
