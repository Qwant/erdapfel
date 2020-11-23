/* global _ */
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const FooterContent = () => <div className="category__panel__pj">
  {_('Results in partnership with PagesJaunes', 'categories')}
</div>;

const PJPartnershipFooter = ({ isMobile }) => {
  const portalContainer = useRef(document.createElement('div'));

  useEffect(() => {
    const current = portalContainer.current;
    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, [isMobile]);

  return isMobile
    ? ReactDOM.createPortal(<FooterContent />, portalContainer.current)
    : <FooterContent />;
};

export default PJPartnershipFooter;
