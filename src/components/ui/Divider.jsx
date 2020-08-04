import React from 'react';

const Divider = ({ paddingTop = 20, paddingBottom = 20 }) =>
  <div
    className="divider"
    style={{
      padding: `${paddingTop}px 0 ${paddingBottom}px 0`,
    }}
  >
    <div className="divider-line" />
  </div>
;

export default Divider;
