/* globals _ */
import React, { useEffect } from 'react';

import { Button } from 'src/components/ui';

export const BackToQwantButton = ({ isMobile }) => {

  useEffect(() => {
    let mapScaleElement;

    window.execOnMapLoaded(() => {
      if (!isMobile) {return;}
      // Hide scale while the button is mounted as it would overlap
      const elems = document.getElementsByClassName('map_control__scale_attribute_container');
      if (elems.length > 0) {
        mapScaleElement = elems[0];
        mapScaleElement.style.visibility = 'hidden';
      }
    });

    return () => {
      if (mapScaleElement) {
        mapScaleElement.style.visibility = 'visible';
      }
    };
  }, [isMobile]);

  return (
    <Button
      className="backToQwantButton"
      icon="arrow-left"
      variant="tertiary"
      onClick={() => window.history.back()}
    >
      {_('Back to Qwant.com')}
    </Button>
  );
};
