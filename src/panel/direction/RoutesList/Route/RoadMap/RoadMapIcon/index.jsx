import React from 'react';
import cx from 'classnames';

const RoadMapIcon = ({ className = '', iconClass }) => (
  <div className={cx(className, 'roadmapIcon', `roadmapIcon--${iconClass}`)} />
);

export default RoadMapIcon;
