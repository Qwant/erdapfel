import React from 'react';
import { useI18n } from 'src/hooks';
import { findBlock } from 'src/libs/pois';

const DescriptionBlock = ({ poi }) => {
  const { _ } = useI18n();

  const block = findBlock(poi.blocks, 'description');

  if (!block) {
    return null;
  }

  const linkLabelBySource = {
    wikipedia: _('Read more on Wikipedia'),
    pagesjaunes: _('Read more on PagesJaunes'),
  };

  return (
    <div className="block-description u-mb-m">
      {block.description && <p>{block.description}</p>}
      {block.url && (
        <a rel="noopener noreferrer" target="_blank" href={block.url}>
          {linkLabelBySource[block.source] || _('Read more')}
        </a>
      )}
    </div>
  );
};

export default DescriptionBlock;
