/* global _ */
import React from 'react';

const MenuButton = ({ onClick }) => {
  return (
    <div
      className="menu__button menu__button_not_logged"
      onClick={onClick}
      title={_('Menu')}
    >
      <div className="menu__button__line" />
      <div className="menu__button__line" />
      <div className="menu__button__line" />
    </div>
  );
};

export default MenuButton;
