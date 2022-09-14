import React, { useState } from 'react';
import PublicTransportRoadMapItem from '../PublicTransportRoadMapItem';
import DefaultRoadMapIcon from '../../Default/DefaultRoadMapIcon';
import PublicTransportLine from '../../../../../PublicTransportLine';
import DefaultLegLine from '../../Default/DefaultLegLine';
import cx from 'classnames';
import { getTransportTypeIcon, formatDuration } from 'src/libs/route_utils';
import { Chevron } from 'src/components/ui';
import { Text, Flex } from '@qwant/qwant-ponents';
import { useI18n } from 'src/hooks';

const PublicTransportLineLeg = ({ leg }) => {
  const { _ } = useI18n();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { mode, info = {}, stops = [], from, to, duration } = leg;

  return (
    <PublicTransportRoadMapItem
      icon={<DefaultRoadMapIcon iconClass={getTransportTypeIcon(leg)} />}
      className={cx(
        'itinerary_roadmap_item--transportLine',
        stops?.length === 0 && 'itinerary_roadmap_item--no-hover'
      )}
      type="TRANSPORT_LINE"
      line={<DefaultLegLine info={info} mode={mode} />}
    >
      <div className="itinerary_roadmap_item_summary" onClick={() => setDetailsOpen(!detailsOpen)}>
        <div>
          <div className="oval" />

          {from?.name && (
            <Flex mt="xxxs" mb="xxs">
              <Text typo="body-2" bold>
                {from.name}
              </Text>
            </Flex>
          )}

          <PublicTransportLine mode={mode} info={info} showDirection />

          {duration && stops.length > 0 && (
            <Flex mt="xxxs">
              <Text typo="caption-1" color="secondary">
                {formatDuration(duration)} ({stops.length + 1} {_('stops')})
              </Text>
            </Flex>
          )}
          {detailsOpen && (
            <div className="itinerary_roadmap_substeps">
              {stops.map((stop, index) => (
                <div className="itinerary_roadmap_substep" key={index}>
                  <div
                    className="itinerary_roadmap_substep_bullet"
                    style={{ borderColor: info.lineColor ? `#${info.lineColor}` : 'black' }}
                  />
                  {stop.name}
                </div>
              ))}
            </div>
          )}
          {to?.name && (
            <Flex mt="s">
              <div className="oval" />
              <Text typo="body-2" bold>
                {to.name}
              </Text>
            </Flex>
          )}
        </div>
        {stops?.length > 0 && <Chevron up={detailsOpen} />}
      </div>
    </PublicTransportRoadMapItem>
  );
};

export default PublicTransportLineLeg;
