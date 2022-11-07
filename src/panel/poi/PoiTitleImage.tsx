import { components } from 'appTypes/idunn';
import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import { ReactComponent as IconLeaf } from '../../../public/images/leaf.svg';
import { findBlock } from 'src/libs/pois';

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
  const ecoResponsible = findBlock(poi.blocks, 'ecoresponsible') !== null;

  return (
    <div
      className="poiTitleImage"
      style={{
        color: icon.color,
        backgroundColor: getLightBackground(icon.color),
      }}
    >
      <div className={`icon icon-${icon.iconClass}`}>
        {ecoResponsible && <IconLeaf className="ecoResponsible-icon" />}
      </div>
    </div>
  );
};

export default PoiTitleImage;
