import { components } from 'appTypes/idunn';
import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import { ReactComponent as IconLeaf } from '../../../public/images/leaf.svg';
import cx from 'classnames';
const defaultIcon = { iconClass: 'marker2', color: '#444648' };

type PoiTitleImageProps = {
  poi: components['schemas']['Place'] & {
    titleImageUrl?: string;
    className?: string;
    subClassName?: string;
  };
  isEcoResponsible?: boolean;
};

const PoiTitleImage: React.FunctionComponent<PoiTitleImageProps> = ({ poi, isEcoResponsible }) => {
  if (poi.titleImageUrl) {
    return (
      <div className="poiTitleImage">
        <img
          className="poiTitleImage__image"
          src={poi.titleImageUrl}
          alt={poi?.name ?? ''}
          loading="lazy"
        />
        {isEcoResponsible && (
          <span className="ecoResponsible-leaf">
            <span className="ecoResponsible-leaf-inner">
              <IconLeaf className="ecoResponsible-icon" />
            </span>
          </span>
        )}
      </div>
    );
  }

  const icon: { color: string; iconClass: string } = IconManager.get(poi) || defaultIcon;

  return (
    <div
      className={cx('poiTitleImage', isEcoResponsible && 'poiTitleImage--ecoresponsible')}
      style={{
        color: icon.color,
        backgroundColor: isEcoResponsible ? 'var(--green-100)' : getLightBackground(icon.color),
      }}
    >
      <div className={`icon icon-${icon.iconClass}`} />
      {isEcoResponsible && (
        <span className="ecoResponsible-leaf">
          <span className="ecoResponsible-leaf-inner">
            <IconLeaf className="ecoResponsible-icon" />
          </span>
        </span>
      )}
    </div>
  );
};

export default PoiTitleImage;
