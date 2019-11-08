import React, { useState, Fragment } from 'react';
import PublicTransportLine from './PublicTransportLine';

const TransportLineLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  const { mode, info = {}, stops = [] } = leg;
  const from = stops[0];
  const to = stops[stops.length - 1];
  const middleStops = stops.slice(1, stops.length - 1);

  return <Fragment>
    <div className="itinerary_roadmap_step">
      <div className="itinerary_roadmap_icon" />
      <div className="itinerary_roadmap_instruction" onClick={() => setDetailsOpen(!detailsOpen)}>
        <PublicTransportLine mode={mode} info={info} />
        {from.name && to.name && <div className="itinerary_roadmap_fromTo">
          {`${from.name} => ${to.name}`}
        </div>}
        {middleStops.length > 0 &&
          <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />}
      </div>
      <div className="itinerary_roadmap_distance" />
    </div>
    {detailsOpen && middleStops.map((stop, index) =>
      <div key={index} className="itinerary_roadmap_step">
        <div className="itinerary_roadmap_icon" />
        <div className="itinerary_roadmap_instruction">{stop.name}</div>
        <div className="itinerary_roadmap_distance" />
      </div>)}
  </Fragment>;
};

export default TransportLineLeg;
