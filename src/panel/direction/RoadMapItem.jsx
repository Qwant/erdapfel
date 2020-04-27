import React from 'react';
import classnames from 'classnames';

const RoadMapItem = ({ children, icon, distance, className, line, ...rest }) =>
  <div className={classnames('itinerary_roadmap_item', className)} {...rest}>
    {line}
    <div className={classnames('itinerary_roadmap_icon', {
      [`itinerary_roadmap_icon_${icon}`]: icon,
    })} />
    <div className="itinerary_roadmap_instruction">{children}</div>
    <div className="itinerary_roadmap_distance u-text--caption">{distance}</div>
  </div>;

export default RoadMapItem;
