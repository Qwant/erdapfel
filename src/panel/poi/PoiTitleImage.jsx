import React from 'react';
import IconManager from 'src/adapters/icon_manager';

const defaultIcon = { iconClass: 'location', color: '#444648' };

const PoiTitleImage = ({ poi }) => {
  const icon = IconManager.get(poi) || defaultIcon;
  return <div className="poiTitleImage">
    {poi.topImageUrl && <div className="poiTitleImage-image"
      style={{ backgroundImage: `url('${poi.topImageUrl}')` }} />}
    <div className={`poiTitleImage-icon icon icon-${icon.iconClass}`}
      style={{ color: icon.color }} />
  </div>;
};

export default PoiTitleImage;
