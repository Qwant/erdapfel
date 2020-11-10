/* global _ */
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const FooterContent = () => <div className="category__panel__pj">
  {_('Results in partnership with PagesJaunes', 'categories')}
</div>;

const PJPartnershipFooter = ({ isMobile }) => {
  const portalContainer = useRef(document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(portalContainer.current);
    return () => {
      document.body.removeChild(portalContainer.current);
    };
  }, [isMobile]);

  return isMobile
    ? ReactDOM.createPortal(<FooterContent />, portalContainer.current)
    : <FooterContent />;
};

export default PJPartnershipFooter;
