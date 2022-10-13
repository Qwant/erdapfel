import React from 'react';
import cx from 'classnames';

const DefaultRoadMapIcon = ({ className = '', iconClass }) => (
  <div className={cx(className, 'roadmapIcon', `roadmapIcon--${iconClass}`)} />
);

export default DefaultRoadMapIcon;
