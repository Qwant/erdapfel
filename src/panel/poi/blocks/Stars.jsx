/* global _n */
import React from 'react';
import Block from './Block';
import { IconStar } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { capitalizeFirst } from 'src/libs/string';
import { useI18n } from '../../../hooks';

const StarsBlock = ({ block, subclass }) => {
  const { _ } = useI18n();

  if (block.has_stars === 'unknown') {
    return null;
  }

  if (block.nb_stars && block.nb_stars > 0) {
    return (
      <Block simple icon={<IconStar fill={ACTION_BLUE_BASE} width={20} />}>
        {capitalizeFirst(
          _n('{subclass} with %d star', '{subclass} with %d stars', block.nb_stars, 'poi', {
            subclass,
          })
        )}
      </Block>
    );
  }

  return (
    <Block simple icon={<IconStar fill={ACTION_BLUE_BASE} width={20} />}>
      {_('Starred {subclass}', 'poi', { subclass })}
    </Block>
  );
};

export default StarsBlock;
