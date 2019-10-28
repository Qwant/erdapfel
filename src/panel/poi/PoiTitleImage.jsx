import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { toCssUrl } from 'src/libs/url_utils';

const defaultIcon = { iconClass: 'location', color: '#444648' };

const PoiTitleImage = ({ poi }) => {
  const icon = IconManager.get(poi) || defaultIcon;
  return <div className="poiTitleImage">
    {poi.topImageUrl && <div className="poiTitleImage-image"
      style={{ backgroundImage: toCssUrl(poi.topImageUrl) }} />}
    <div className={`poiTitleImage-icon icon icon-${icon.iconClass}`}
      style={{ color: icon.color }} />
  </div>;
};

export default PoiTitleImage;
