/* global _ */
import React from 'react';
import RoadMapStep from './RoadMapStep';
import RoadMapItem from './RoadMapItem';
import { getAllSteps } from 'src/libs/route_utils';
import PublicTransportRoadMap from './PublicTransportRoadMap';
import { fire } from 'src/libs/customEvents';
import { getInputValue } from 'src/libs/suggest';

const RoadMap = ({ route, origin, destination, vehicle }) => {
  if (vehicle === 'publicTransport') {
    return <PublicTransportRoadMap route={route} origin={origin} destination={destination} />;
  }

  return <div className="itinerary_roadmap">
    <RoadMapItem icon="origin">
      {`${_('Start')} ${getInputValue(origin)}`}
    </RoadMapItem>
    {getAllSteps(route).map((step, index) => <RoadMapStep
      key={index}
      step={step}
      onMouseOver={() => { fire('highlight_step', index); }}
      onMouseOut={() => { fire('unhighlight_step', index); }}
      onClick={() => { fire('zoom_step', step); }}
    />)}
  </div>;
};

export default RoadMap;
