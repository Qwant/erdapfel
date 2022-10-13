import React from 'react';

export type ModalProps = {
  children: JSX.Element[];
  onClose: React.HTMLProps<HTMLDivElement>['onClick'];
};

const Modal: React.FunctionComponent<ModalProps> = ({ children, onClose }) => (
  <div className="modal_overlay modal--active" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default Modal;
