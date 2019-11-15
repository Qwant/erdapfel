import React, { useState, Fragment } from 'react';
import RoadMapItem from './RoadMapItem';
import PublicTransportLine from './PublicTransportLine';
import { getTransportTypeIcon } from 'src/libs/route_utils';

const TransportLineLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  const { mode, info = {}, stops = [] } = leg;
  const from = stops[0];
  const to = stops[stops.length - 1];

  return <Fragment>
    <RoadMapItem icon={getTransportTypeIcon(leg)}>
      <div
        className="itinerary_roadmap_item_summary"
        onClick={() => setDetailsOpen(!detailsOpen)}
      >
        <div>
          <PublicTransportLine mode={mode} info={info} />
          {from.name && to.name && <div className="itinerary_roadmap_fromTo">
            {`${from.name} => ${to.name}`}
          </div>}
        </div>
        <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />
      </div>
    </RoadMapItem>
    {detailsOpen && stops.map((stop, index) =>
      <RoadMapItem key={index} icon="stop">
        {stop.name}
      </RoadMapItem>)}
  </Fragment>;
};

export default TransportLineLeg;
