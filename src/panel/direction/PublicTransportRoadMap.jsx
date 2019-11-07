/* global _ */
import React from 'react';
import WalkLeg from './WalkLeg';
import TransportLineLeg from './TransportLineLeg';

const Leg = ({ leg }) => {
  // @TODO: decide what to do with waiting parts. For now just ignore.
  if (leg.mode === 'WAIT') {
    return null;
  }

  return leg.mode === 'WALK'
    ? <WalkLeg leg={leg} />
    : <TransportLineLeg leg={leg} />;
};

const PublicTransportRoadMap = ({ route, origin }) => {
  return <div className="itinerary_roadmap">
    <div className="itinerary_roadmap_step">
      <div className="itinerary_roadmap_icon itinerary_roadmap_icon_origin" />
      <div className="itinerary_roadmap_instruction">{`${_('Start')} ${origin}`}</div>
      <div className="itinerary_roadmap_distance" />
    </div>
    {route.legs.map((leg, index) => <Leg key={index} leg={leg} />)}
  </div>;
};

export default PublicTransportRoadMap;
