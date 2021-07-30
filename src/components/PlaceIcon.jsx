import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import classnames from 'classnames';
import { IconHeart, IconGeoloc } from 'src/components/ui/icons';
import { PINK_DARK, PINK_LIGHTER, ACTION_BLUE_DARK } from 'src/libs/colors';

const PlaceIcon = ({ place, category, withBackground, className, isFavorite = false }) => {
  if (isFavorite) {
    return <FavoriteIcon className={className} />;
  }

  if (place?.type === 'geoloc') {
    return <GeolocIcon className={className} />;
  }

  let iconClass = '',
    color = '';

  if (place) {
    const icon = IconManager.get(place);
    iconClass = icon.iconClass;
    color = icon.color;
  }

  if (category) {
    iconClass = category.iconName;
    color = category.color;
  }

  return (
    <div
      className={classnames(`placeIcon icon icon-${iconClass}`, className)}
      style={{
        color,
        backgroundColor: withBackground ? getLightBackground(color) : null,
      }}
    />
  );
};

const GeolocIcon = ({ className }) => {
  return (
    <div
      className={classnames('placeIcon', className)}
      style={{
        color: ACTION_BLUE_DARK,
        backgroundColor: getLightBackground(ACTION_BLUE_DARK),
      }}
    >
      <IconGeoloc fill="currentColor" width={20} />
    </div>
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
      <IconHeart fill="currentColor" width={20} />
    </div>
  );
};

export default PlaceIcon;
