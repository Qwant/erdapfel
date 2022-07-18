import React, { useState } from 'react';
import PublicTransportRoadMapItem from '../PublicTransportRoadMapItem';
import RoadMapIcon from '../../RoadMapIcon';
import PublicTransportLine from '../../../../../PublicTransportLine';
import LegLine from '../../LegLine';
import { getTransportTypeIcon, formatDuration } from 'src/libs/route_utils';
import { Chevron } from 'src/components/ui';
import { Text } from '@qwant/qwant-ponents';

const PublicTransportLineLeg = ({ leg }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { mode, info = {}, stops = [], from, to, duration } = leg;

  return (
    <PublicTransportRoadMapItem
      icon={<RoadMapIcon iconClass={getTransportTypeIcon(leg)} />}
      className="itinerary_roadmap_item--transportLine"
      type="TRANSPORT_LINE"
      line={<LegLine info={info} mode={mode} />}
    >
      <div
        className="itinerary_roadmap_item_summary itinerary_roadmap_item_summary--openable"
        onClick={() => setDetailsOpen(!detailsOpen)}
      >
        <div>
          <PublicTransportLine mode={mode} info={info} showDirection />
          <Text typo="body-2" color="secondary" bold>
            {from?.name}
          </Text>
          <Text typo="caption-1" color="secondary">
            {formatDuration(duration)}
          </Text>
        </div>
        <Chevron up={detailsOpen} />
      </div>
      {detailsOpen && (
        <div className="itinerary_roadmap_substeps">
          {[from, ...stops, to].map((stop, index) => (
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
    </PublicTransportRoadMapItem>
  );
};

export default PublicTransportLineLeg;
