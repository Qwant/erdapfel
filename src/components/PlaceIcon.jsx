import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import classnames from 'classnames';

const PlaceIcon = ({ place, withBackground, className, ...rest }) => {
  const { iconClass, color, icomoon } = place // Place should be a poi
    ? IconManager.get(place)
    : rest;

  return <div
    className={classnames('placeIcon', `icon-${iconClass}`, { icon: !icomoon }, className)}
    style={{
      color,
      backgroundColor: withBackground ? getLightBackground(color) : null,
    }}
  />;
};

export default PlaceIcon;
