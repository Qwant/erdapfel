import React from 'react';

const Modal = ({ children, onClose }) =>
  <div className="modal_overlay modal--active" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>;

export default Modal;
