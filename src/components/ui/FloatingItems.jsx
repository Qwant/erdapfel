import React from 'react';

const FloatingItems = ({ items, position }) =>
  <div
    className="floatingItems"
    style={position === 'left'
      ? { left: 12, transform: 'translateY(calc(-100% - 32px))' }
      : { right: 12 }}>
    {items}
  </div>
;

export default FloatingItems;
