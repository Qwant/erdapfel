import React from 'react';
import Block from './Block';
import { IconStar } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { capitalizeFirst } from 'src/libs/string';
import { useI18n } from 'src/hooks';

const StarsBlock = ({ block, subclass }) => {
  const { _, _n } = useI18n();

  if (!hasStars(block)) {
    return null;
  }

  if (block.ratings[0].nb_stars && block.ratings[0].nb_stars > 0) {
    return (
      <Block simple icon={<IconStar fill={ACTION_BLUE_BASE} width={20} />}>
        {capitalizeFirst(
          _n(
            '{subclass} with %d star',
            '{subclass} with %d stars',
            block.ratings[0].nb_stars,
            'poi',
            { subclass }
          )
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

export const hasStars = stars =>
  stars && stars.ratings && stars.ratings[0] && stars.ratings[0].has_stars === 'yes';
