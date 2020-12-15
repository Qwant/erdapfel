import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import classnames from 'classnames';
import { Heart } from 'src/components/ui/icons';

const favoriteColor = '#cd1690';

const PlaceIcon = ({ place, withBackground, className, isFavorite = false, ...rest }) => {
  const { iconClass, color, icomoon } = place // Place should be a poi
    ? IconManager.get(place)
    : rest;

  if (isFavorite) {
    return <FavoriteIcon className={className} />;
  }

  return <div
    className={classnames('placeIcon', `icon-${iconClass}`, { icon: !icomoon }, className)}
    style={{
      color,
      backgroundColor: withBackground ? getLightBackground(color) : null,
    }}
  />;
};

const FavoriteIcon = ({ className }) => {
  return (
    <div
      className={classnames('placeIcon', className)}
      style={{
        color: favoriteColor,
        backgroundColor: getLightBackground(favoriteColor),
      }}
    >
      <Heart
        color={favoriteColor}
        width={20}
      />
    </div>
  );
};

export default PlaceIcon;
