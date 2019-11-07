import React from 'react';
import PublicTransportLine from './PublicTransportLine';

const TransportLineLeg = ({ leg }) => {
  const { mode, info = {}, stops = [] } = leg;
  const from = stops[0];
  const to = stops[stops.length - 1];

  return <div className="itinerary_roadmap_step">
    <div className="itinerary_roadmap_icon" />
    <div className="itinerary_roadmap_instruction">
      <PublicTransportLine mode={mode} info={info} />
      {from && to && <div className="itinerary_roadmap_fromTo">
        {`${from.name} => ${to.name}`}
      </div>}
    </div>
    <div className="itinerary_roadmap_distance" />
  </div>;
};

export default TransportLineLeg;
