/* global _ */
import React from 'react';
import MasqAvatar from './MasqAvatar';

const MenuButton = ({ masqUser, onClick }) => {
  if (!masqUser) {
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
  }
  return <MasqAvatar user={masqUser} className="menu__button" onClick={onClick} />;
};

export default MenuButton;
