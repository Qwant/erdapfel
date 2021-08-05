import React from 'react';

const FloatingButton = ({ title, onClick, icon }) => (
  <button title={title} className="floatingButton" onClick={onClick}>
    {icon}
  </button>
);
export default FloatingButton;
