/* globals _ */
import React from 'react';

import { Button } from 'src/components/ui';

export const BackToQwantButton = ({ ...props }) => {

  return (
    <Button
      className="backToQwantButton"
      icon="arrow-left"
      variant="tertiary"
      onClick={() => window.history.back()}
      {...props}
    >
      {_('Back to Qwant.com')}
    </Button>
  );
};
