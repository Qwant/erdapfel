import React from 'react';
import Block from './Block';
import { capitalizeFirst } from 'src/libs/string';
import { useI18n } from 'src/hooks';
import { IconStar } from '@qwant/qwant-ponents';

const Stars = ({ block, inline, subclass }) => {
  const { _, _n } = useI18n();

  if (!hasStars(block)) {
    return null;
  }

  const nbStars = block.ratings[0].nb_stars;

  if (inline) {
    return (
      <span>{nbStars > 0 ? _n('%d star', '%d stars', nbStars, 'poi') : _('Starred', 'poi')}</span>
    );
  }

  if (nbStars > 0) {
    return (
      <Block simple icon={<IconStar fill="var(--green-500)" size={20} />}>
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
    <Block simple icon={<IconStar fill="var(--green-500)" size={20} />}>
      {capitalizeFirst(_('Starred {subclass}', 'poi', { subclass }))}
    </Block>
  );
};

export default Stars;

export const hasStars = stars => stars?.ratings?.[0]?.has_stars === 'yes' || false;
