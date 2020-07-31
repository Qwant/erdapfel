import React from 'react';

const Block = ({ icon, title, children }) =>
  <div className="block">
    <i className={`block-icon icon-${icon}`}/>
    <div className="block-content">
      <div className="u-firstCap u-text--subtitle u-mb-2">{title}</div>
      {children}
    </div>
  </div>;


export default Block;
