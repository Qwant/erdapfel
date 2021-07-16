/* global _ */
import React from 'react';
import { Divider } from 'src/components/ui';
import { toCssUrl } from 'src/libs/url_utils';
import { findBlock } from 'src/libs/pois';

const ImagesBlock = ({ poi }) => {
  const imagesBlock = findBlock(poi.blocks, 'images');

  const images = imagesBlock?.images.slice(0, 3);
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <Divider paddingTop={0} />
      <div className="poi_panel__pictures">
        <h3 className="u-text--smallTitle u-mb-l">{_('Photos')}</h3>
        <div className="poi_panel__pictures_tiles">
          {images.map(i => (
            <a
              key={i.url}
              target="_blank"
              rel="noopener noreferrer"
              href={i.source_url}
              className="poi_panel__pictures_tile"
              style={{ backgroundImage: toCssUrl(i.url) }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ImagesBlock;
