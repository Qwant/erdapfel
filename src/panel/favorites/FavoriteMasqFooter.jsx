/* globals _ */
import React from 'react';

const FavoriteMasqFooter = ({ onOpenMasq, onClose }) =>
  <div className="favorite_panel__masq_footer">
    <div className="favorite_panel__masq_footer_text" onClick={onOpenMasq}>
      <span>{_('Use')}</span>
      <div className="icon-masq favorite_panel__masq_footer_icon" />
      <span>{_('to secure your favorites on all your devices')}</span>
    </div>
    <div className="favorite_panel__masq_footer_image" onClick={onOpenMasq}/>
    <p className="favorites_panel__masq_footer_close" onClick={onClose}>
      <i className="icon-x" />
    </p>
  </div>;

export default FavoriteMasqFooter;
