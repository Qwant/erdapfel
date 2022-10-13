import React from 'react';

export type FloatingButtonProps = {
  title: HTMLButtonElement['title'];
  onClick: React.HTMLProps<HTMLButtonElement>['onClick'];
  icon: JSX.Element;
};

const FloatingButton: React.FunctionComponent<FloatingButtonProps> = ({ title, onClick, icon }) => (
  <button title={title} className="floatingButton" onClick={onClick}>
    {icon}
  </button>
);

export default FloatingButton;
