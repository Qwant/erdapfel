/* globals _ */
import React, { useEffect } from 'react';

import { Button } from 'src/components/ui';

const hiddenAttributeClassName = 'map_control__scale_attribute_container--hidden';

export const BackToQwantButton = ({ isMobile }) => {

  useEffect(() => {
    if (!isMobile) {return;}

    // Hide scale while the button is mounted as it would overlap
    document.body.classList.add(hiddenAttributeClassName);
    return () => document.body.classList.remove(hiddenAttributeClassName);
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
