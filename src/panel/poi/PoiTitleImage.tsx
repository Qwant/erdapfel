import { components } from 'appTypes/idunn';
import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';

const defaultIcon = { iconClass: 'marker2', color: '#444648' };

type PoiTitleImageProps = {
  poi: components['schemas']['Place'] & {
    titleImageUrl?: string;
    className?: string;
    subClassName?: string;
  };
};

const PoiTitleImage: React.FunctionComponent<PoiTitleImageProps> = ({ poi }) => {
  if (poi.titleImageUrl) {
    return (
      <div className="poiTitleImage">
        <img
          className="poiTitleImage__image"
          src={poi.titleImageUrl}
          alt={poi?.name ?? ''}
          loading="lazy"
        />
      </div>
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
