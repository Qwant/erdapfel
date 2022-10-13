import React from 'react';
import cx from 'classnames';
import { Flex, Text } from '@qwant/qwant-ponents';
import { Divider } from 'src/components/ui';

const PublicTransportRoadMapItem = ({
  children,
  icon,
  distance,
  className,
  line,
  type,
  ...rest
}) => (
  <>
    <div className={cx('itinerary_roadmap_item', className)} {...rest}>
      {line}
      <Flex>
        <div className="itinerary_roadmap_item_icon">{icon}</div>
        <div className="itinerary_roadmap_step_description">
          <Text typo="body-2">{children}</Text>
          {type === 'WALK' && (
            <Text typo="caption-1" className="itinerary_roadmap_step_deistance">
              {distance}
            </Text>
          )}
        </div>
      </Flex>
    </div>
    <Divider paddingTop={0} paddingBottom={0} />
  </>
);

export default PublicTransportRoadMapItem;
