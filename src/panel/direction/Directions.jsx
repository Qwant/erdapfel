import React, { useEffect } from 'react';
import { DirectionProvider } from './directionStore';
import DirectionPanel from './DirectionPanel';
import { usePageTitle, useI18n } from 'src/hooks';

const Directions = props => {
  const { _ } = useI18n();

  usePageTitle(_('Directions'));

  useEffect(() => {
    document.body.classList.add('directions-open');
    return () => {
      document.body.classList.remove('directions-open');
    };
  }, []);

  return (
    <DirectionProvider>
      <DirectionPanel {...props} />
    </DirectionProvider>
  );
};

export default Directions;
