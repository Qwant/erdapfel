import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import classnames from 'classnames';
import { IconHeart, IconGeoloc, IconHistory, Magnifier } from 'src/components/ui/icons';
import type { TPoi } from 'src/adapters/poi/poi';

type PlaceIconProps = {
  className?: string;
  place?: TPoi;
  category?: any;
  withBackground?: boolean;
  isHistory?: boolean;
  isFavorite?: boolean;
};

const PlaceIcon: React.FunctionComponent<PlaceIconProps> = ({
  className,
  place,
  category,
  withBackground,
  isFavorite = false,
  isHistory = false,
}) => {
  if (isFavorite) {
    return <VariantIcon className={className} variant="favorite" IconComponent={IconHeart} />;
  }

  if (isHistory) {
    return <VariantIcon className={className} variant="history" IconComponent={IconHistory} />;
  }

  if (place?.type === 'geoloc') {
    return <VariantIcon className={className} variant="geoloc" IconComponent={IconGeoloc} />;
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
    return <VariantIcon className={className} variant="search" IconComponent={Magnifier} />;
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
