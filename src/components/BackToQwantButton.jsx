import React, { useEffect } from 'react';
import { Button, IconArrowLeftLine } from '@qwant/qwant-ponents';
import { useI18n } from 'src/hooks';

const hiddenAttributeClassName = 'map_control__scale_attribute_container--hidden';

export const BackToQwantButton = ({ isMobile }) => {
  const { _ } = useI18n();

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    // Hide scale while the button is mounted as it would overlap
    document.body.classList.add(hiddenAttributeClassName);
    return () => document.body.classList.remove(hiddenAttributeClassName);
  }, [isMobile]);

  return (
    <Button
      className="backToQwantButton"
      variant="tertiary-black"
      onClick={() => window.history.back()}
    >
      <IconArrowLeftLine />
      {_('Back to Qwant.com')}
    </Button>
  );
};
