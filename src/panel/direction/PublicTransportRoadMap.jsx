/* global _ */
import React from 'react';
import WalkLeg from './WalkLeg';
import TransportLineLeg from './TransportLineLeg';
import RoadMapItem from './RoadMapItem';

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
  return <div className="itinerary_roadmap">
    <RoadMapItem icon="origin">
      {`${_('Start')} ${origin}`}
    </RoadMapItem>
    {route.legs.map((leg, index) => <Leg key={index} leg={leg} />)}
    <RoadMapItem icon="arrive">
      {`${_('Arrival')} ${destination}`}
    </RoadMapItem>
  </div>;
};

export default PublicTransportRoadMap;
