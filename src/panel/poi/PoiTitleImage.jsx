import React from 'react';
import IconManager from 'src/adapters/icon_manager';

const defaultIcon = { iconClass: 'location', color: '#444648' };

const PoiTitleImage = ({ poi }) => {
  const icon = IconManager.get(poi) || defaultIcon;
  return <div className="poi_panel__title_image">
    {poi.topImageUrl && <div className="poi_panel__image"
      style={{ backgroundImage: `url('${poi.topImageUrl}')` }} />}
    <div className={`poi_panel__title__symbol icon icon-${icon.iconClass}`}
      style={{ color: icon.color }} />
  </div>;
};

export default PoiTitleImage;
