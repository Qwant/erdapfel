import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import classnames from 'classnames';
import { IconHeart, IconGeoloc, IconHistory, Magnifier } from 'src/components/ui/icons';

const PlaceIcon = ({
  place,
  category,
  withBackground,
  className,
  isFavorite = false,
  isHistory = false,
}) => {
  if (isFavorite) {
    return <VariantIcon variant="favorite" IconComponent={IconHeart} className={className} />;
  }

  if (isHistory) {
    return <VariantIcon variant="history" IconComponent={IconHistory} className={className} />;
  }

  if (place?.type === 'geoloc') {
    return <VariantIcon variant="geoloc" IconComponent={IconGeoloc} className={className} />;
  }

  let iconClass = '',
    color = '';

  if (place) {
    const icon = IconManager.get(place);
    iconClass = icon.iconClass;
    color = icon.color;
  } else if (category && category.iconName) {
    iconClass = category.iconName;
    color = category.color;
  } else {
    return <VariantIcon variant="search" IconComponent={Magnifier} className={className} />;
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

const VariantIcon = ({ variant, className, IconComponent }) => {
  return (
    <div className={classnames('placeIcon', { [`placeIcon--${variant}`]: variant }, className)}>
      <IconComponent fill="currentColor" width={20} />
    </div>
  );
};

export default PlaceIcon;
