import React from 'react';
import classnames from 'classnames';
import { Flex } from '@qwant/qwant-ponents';
import { Divider } from 'src/components/ui';

const PublicTransportRoadMapItem = ({
  children,
  icon,
  distance,
  className,
  line,
  alignTop,
  ...rest
}) => (
  <>
    <div className={classnames('itinerary_roadmap_item', className)} {...rest}>
      {line}
      <Flex alignCenter={!alignTop}>
        <div className="itinerary_roadmap_item_icon">{icon}</div>
        <div className="itinerary_roadmap_step_description">
          <span className="itinerary_roadmap_instruction u-text--smallTitle">{children}</span>
          <div className="u-text--subtitle">{distance}</div>
        </div>
      </Flex>
    </div>
    <Divider paddingTop={0} paddingBottom={0} />
  </>
);

export default PublicTransportRoadMapItem;
