import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import classnames from 'classnames';
import { Heart } from 'src/components/ui/icons';
import { PINK_DARK, PINK_LIGHTER } from 'src/libs/colors';

const PlaceIcon = ({ place, category, withBackground, className, isFavorite = false }) => {
  let iconClass = '',
    color = '',
    icomoon = false;

  if (place) {
    const icon = IconManager.get(place);
    iconClass = icon.iconClass;
    color = icon.color;
    icomoon = icon.icomoon;
  }

  if (category) {
    iconClass = category.iconName;
    color = category.color;
  }

  if (isFavorite) {
    return <FavoriteIcon className={className} />;
  }

  return (
    <div
      className={classnames('placeIcon', `icon-${iconClass}`, { icon: !icomoon }, className)}
      style={{
        color,
        backgroundColor: withBackground ? getLightBackground(color) : null,
      }}
    />
  );
};

const FavoriteIcon = ({ className }) => {
  return (
    <div
      className={classnames('placeIcon', className)}
      style={{
        color: PINK_DARK,
        backgroundColor: PINK_LIGHTER,
      }}
    >
      <Heart color={PINK_DARK} width={20} />
    </div>
  );
};

export default PlaceIcon;
