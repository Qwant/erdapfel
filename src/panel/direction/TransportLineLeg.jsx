import React, { useState } from 'react';
import RoadMapItem from './RoadMapItem';
import PublicTransportLine from './PublicTransportLine';
import { getTransportTypeIcon, sanitizeStationName } from 'src/libs/route_utils';

const TransportLineLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  const { mode, info = {}, stops = [] } = leg;
  const from = stops[0];
  const to = stops[stops.length - 1];

  return <RoadMapItem
    icon={getTransportTypeIcon(leg)}
    className="itinerary_roadmap_item--transportLine"
  >
    <div
      className="itinerary_roadmap_item_summary"
      onClick={() => setDetailsOpen(!detailsOpen)}
    >
      <div>
        <PublicTransportLine mode={mode} info={info} />
        {!detailsOpen && from.name && to.name && <div>
          {sanitizeStationName(from.name)}{' '}
          <i className="icon-chevrons-right" />{' '}
          {sanitizeStationName(to.name)}
        </div>}
      </div>
      <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />
    </div>
    {detailsOpen && <div className="itinerary_roadmap_substeps">
      {stops.map((stop, index) => <div key={index}>
        {sanitizeStationName(stop.name)}
      </div>)}
    </div>}
  </RoadMapItem>;
};

export default TransportLineLeg;
