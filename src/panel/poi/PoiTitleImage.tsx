import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { toCssUrl } from 'src/libs/url_utils';
import { getLightBackground } from 'src/libs/colors';

const defaultIcon = { iconClass: 'marker2', color: '#444648' };

type PoiTitleImageProps = {
  poi: {
    className: string;
    subClassName: string;
    type: string;
    titleImageUrl: string;
  };
};

const PoiTitleImage: React.FunctionComponent<PoiTitleImageProps> = ({ poi }) => {
  if (poi.titleImageUrl) {
    return (
      <div
        className="poiTitleImage poiTitleImage--image"
        style={{ backgroundImage: toCssUrl(poi.titleImageUrl) }}
      />
    );
  }

  const icon: { color: string; iconClass: string } = IconManager.get(poi) || defaultIcon;
  return (
    <div
      className="poiTitleImage"
      style={{
        color: icon.color,
        backgroundColor: getLightBackground(icon.color),
      }}
    >
      <div className={`icon icon-${icon.iconClass}`} />
    </div>
  );
};

export default PoiTitleImage;
