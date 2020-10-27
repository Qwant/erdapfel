import React from 'react';

const FloatingButton = ({ onClick, icon }) =>
  <button
    className="floatingButton"
    onClick={onClick}
  >
    <i className={`icon-${icon}`} />
  </button>
;

export default FloatingButton;
