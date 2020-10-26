import React from 'react';
import classnames from 'classnames';

import { Divider, Flex } from 'src/components/ui';

const RoadMapItem = ({ children, icon, distance, className, line, ...rest }) =>
  <>
    <div className={classnames('itinerary_roadmap_item', className)} {...rest}>
      {line}
      <Flex alignItems="flex-start">
        <div className={classnames(
          'itinerary_roadmap_icon',
          { [`itinerary_roadmap_icon_${icon}`]: icon }
        )} />
        <div className="itinerary_roadmap_step_description">
          <span className="itinerary_roadmap_instruction u-text--smallTitle">{children}</span>
          <div className="u-text--subtitle">{distance}</div>
        </div>
      </Flex>
    </div>
    <Divider paddingTop={0} paddingBottom={0} />
  </>;

export default RoadMapItem;
