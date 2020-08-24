import React from 'react';
import classNames from 'classnames';

const Block = ({ icon, title, children, className }) =>
  <div className={classNames('block', className)}>
    <i className={`block-icon icon-${icon}`}/>
    <div className="block-content">
      <div className="u-firstCap u-text--caption u-mb-2">{title}</div>
      <div className="block-value">{children}</div>
    </div>
  </div>;


export default Block;
