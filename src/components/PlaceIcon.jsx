import React from 'react';
import IconManager from 'src/adapters/icon_manager';
import { getLightBackground } from 'src/libs/colors';
import classnames from 'classnames';

const PlaceIcon = ({ place, withBackground }) => {
  const { iconClass, color, icomoon } = IconManager.get(place);

  return <div
    className={classnames('placeIcon', `icon-${iconClass}`, { icon: !icomoon })}
    style={{
      color,
      backgroundColor: withBackground ? getLightBackground(color) : null,
    }}
  />;
};

export default PlaceIcon;
