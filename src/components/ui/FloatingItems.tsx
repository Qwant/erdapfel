import React from 'react';

export type FloatingItemsProps = {
  items: JSX.Element[];
  position: Position;
};

enum Position {
  left = 'left',
  right = 'right',
}

const FloatingItems: React.FunctionComponent<FloatingItemsProps> = ({ items, position }) => (
  <div
    className="floatingItems"
    style={position === 'left' ? { paddingLeft: 12 } : { paddingRight: 12, right: 0 }}
  >
    {items}
  </div>
);
export default FloatingItems;
