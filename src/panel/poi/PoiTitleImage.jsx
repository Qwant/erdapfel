import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { toCssUrl } from 'src/libs/url_utils';

const defaultIcon = { iconClass: 'location', color: '#444648' };

const PoiTitleImage = ({ poi, iconOnly }) => {
  if (poi.topImageUrl && !iconOnly) {
    return <div
      className="poiTitleImage poiTitleImage--image"
      style={{ backgroundImage: toCssUrl(poi.topImageUrl) }}
    />;
  }

  const icon = IconManager.get(poi) || defaultIcon;
  return <div className="poiTitleImage">
    <div className={`icon icon-${icon.iconClass}`} style={{ color: icon.color }} />
  </div>;
};

export default PoiTitleImage;
