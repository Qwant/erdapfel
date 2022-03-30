import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const RootModal: React.FunctionComponent = ({ children }) => {
  const el = useRef(document.createElement('div'));

  useEffect(() => {
    const modalRoot = document.querySelector('.react_modal__container') as HTMLElement;
    const currentEl = el.current;
    modalRoot?.appendChild(el.current);
    return () => void modalRoot?.removeChild(currentEl);
  }, [el]);

  return createPortal(children, el.current);
};
