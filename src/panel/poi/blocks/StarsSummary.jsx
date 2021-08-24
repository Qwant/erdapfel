import React from 'react';
import { capitalizeFirst } from 'src/libs/string';
import { useI18n } from 'src/hooks';

const StarsSummary = ({ block }) => {
  const { _, _n } = useI18n();

  if (!(block?.ratings?.[0]?.has_stars === 'yes')) {
    return null;
  }

  if (block.ratings[0].nb_stars && block.ratings[0].nb_stars > 0) {
    return (
      <span>
        {' · ' + capitalizeFirst(_n('%d star', '%d stars', block.ratings[0].nb_stars, 'poi'))}
      </span>
    );
  }

  return <span>{' · ' + capitalizeFirst(_('Starred', 'poi'))}</span>;
};

export default StarsSummary;
