import React from 'react';

import { Button } from 'src/components/ui';

export const BackToQwantButton = ({ ...props }) => {

  return (
    <Button
      icon="arrow-left"
      variant="tertiary"
      onClick={() => window.history.back()}
      style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 4px 0 rgba(12, 12, 14, 0.2), 0 0 2px 0 rgba(12, 12, 14, 0.12)',
      }}
      {...props}
    >
      Retour sur Qwant
    </Button>
  );
};
