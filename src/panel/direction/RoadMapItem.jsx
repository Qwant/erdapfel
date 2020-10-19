import React from 'react';
import classnames from 'classnames';

import { Divider, Flex } from 'src/components/ui';

const RoadMapItem = ({ children, icon, distance, className, ...rest }) =>
  <div className={classnames('itinerary_roadmap_item', className)} {...rest}>
    <Flex className="itinerary_roadmap_item-block">
      <div className={classnames(
        'itinerary_roadmap_icon',
        { [`itinerary_roadmap_icon_${icon}`]: icon }
      )} />
      <div>
        <span className="itinerary_roadmap_instruction u-text--smallTitle">{children}</span>
        <div className="u-text--subtitle">{distance}</div>
      </div>
    </Flex>
    <Divider paddingTop={0} paddingBottom={0} />
  </div>;

export default RoadMapItem;
