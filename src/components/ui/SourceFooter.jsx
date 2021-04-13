import React, { useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { useDevice } from 'src/hooks';
import { PanelContext } from 'src/libs/panelContext';

const SourceFooter = ({ children }) => {
  const portalContainer = useRef(document.createElement('div'));
  const { isMobile } = useDevice();
  const { size: panelSize } = useContext(PanelContext);

  useEffect(() => {
    const current = portalContainer.current;
    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, [isMobile]);

  if (panelSize === 'minimized') {
    return null;
  }

  const content = <div className="sourceFooter">{children}</div>;

  return isMobile ? ReactDOM.createPortal(content, portalContainer.current) : content;
};

export default SourceFooter;
