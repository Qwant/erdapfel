import React, { useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { DeviceContext } from 'src/libs/device';
import { PanelContext } from 'src/libs/panelContext';

const SourceFooter = ({ children }) => {
  const portalContainer = useRef(document.createElement('div'));
  const { isMobile } = useContext(DeviceContext);
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
