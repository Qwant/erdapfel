import React, { useState } from 'react';
import RoadMapItem from './RoadMapItem';
import PublicTransportLine from './PublicTransportLine';
import LegLine from './LegLine';
import { getTransportTypeIcon, formatDuration } from 'src/libs/route_utils';

const TransportLineLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  const { mode, info = {}, stops = [], from, to, duration } = leg;

  return <RoadMapItem
    icon={getTransportTypeIcon(leg)}
    className="itinerary_roadmap_item--transportLine"
    line={<LegLine info={info} mode={mode} />}
    distance={formatDuration(duration)}
  >
    <div
      className="itinerary_roadmap_item_summary itinerary_roadmap_item_summary--openable"
      onClick={() => setDetailsOpen(!detailsOpen)}
    >
      <div>
        <PublicTransportLine mode={mode} info={info} />
        {!detailsOpen && from.name && to.name && <div>
          {from.name} <i className="icon-chevrons-right" /> {to.name}
        </div>}
      </div>
      <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />
    </div>
    {detailsOpen && <div className="itinerary_roadmap_substeps">
      <div>{from.name}</div>
      {stops.map((stop, index) => <div key={index}>{stop.name}</div>)}
      <div>{to.name}</div>
    </div>}
  </RoadMapItem>;
};

export default TransportLineLeg;
