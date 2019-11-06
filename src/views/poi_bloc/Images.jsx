/* global _ */
import React from 'react';
import { toCssUrl } from 'src/libs/url_utils';

const Image = ({
  href,
  url,
  classes,
}) => <a
  target='_blank'
  rel='noopener noreferrer'
  href={ href }
  className={ classes }
  style={{ backgroundImage: toCssUrl(url) }}
/>;

function createImages(images) {
  if (images.length < 2) {
    return null;
  } else if (images.length === 2) {
    return <div className='poi_panel__pictures_block poi_panel__pictures_second_block'>
      <Image href={images[1].source_url} url={images[1].url} classes='poi_panel__pictures_block_full' />
    </div>;
  }
  return <div
    className={ 'poi_panel__pictures_block' +
      ' poi_panel__pictures_second_block' +
      ' poi_panel__pictures_block-multiple' }>
    <Image href={images[1].source_url} url={images[1].url} classes='poi_panel__pictures_block_short' />
    <Image href={images[2].source_url} url={images[2].url} classes='poi_panel__pictures_block_short' />
  </div>;
}

const ImagesBlock = ({
  block,
  poi,
}) => {
  const images = block.images.filter(img => img.url !== poi.topImageUrl);
  if (!images || images.length === 0) {
    return null;
  }

  return <div className="poi_panel__pictures">
    <h5 className="poi_panel__pictures_title">
      <i className="icon-icon_camera"></i>
      { _('Photos') }
    </h5>
    <Image
      href={images[0].source_url}
      url={images[0].url}
      classes='poi_panel__pictures_block poi_panel__pictures_first_block' />
    { createImages(images) }
  </div>;
};

export default ImagesBlock;
