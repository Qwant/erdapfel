import React from 'react';

const PlaceholderText = ({ length = 10, tagName = 'div', className }) => {
  const DomTag = tagName;
  return <DomTag className={className}>
    <span className="u-placeholder u-placeholder--text">
      {Array.from({ length }).map(() => '_').join('')}
    </span>
  </DomTag>;
};

export default PlaceholderText;
