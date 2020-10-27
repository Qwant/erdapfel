import React from 'react';
import WalkLeg from './WalkLeg';
import TransportLineLeg from './TransportLineLeg';
import RoadMapPoint from './RoadMapPoint';
import LegLine from './LegLine';

const Leg = ({ leg }) => {
  // @TODO: decide what to do with waiting parts. For now just ignore.
  if (leg.mode === 'WAIT') {
    return null;
  }

  return leg.mode === 'WALK'
    ? <WalkLeg leg={leg} />
    : <TransportLineLeg leg={leg} />;
};

const PublicTransportRoadMap = ({ route, origin, destination }) => {
  return <div className="itinerary_roadmap itinerary_roadmap--publicTransport">
    <RoadMapPoint point={origin} line={<LegLine mode="WALK" />} />
    {route.legs.map((leg, index) => <Leg key={index} leg={leg} />)}
    <RoadMapPoint point={destination} />
  </div>;
};

export default PublicTransportRoadMap;
