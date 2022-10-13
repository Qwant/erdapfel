import React from 'react';
import DefaultRoadMapPoint from '../DefaultRoadMapPoint';
import DefaultRoadMapStep from '../DefaultRoadMapStep';
import { fire } from 'src/libs/customEvents';
import { components } from 'appTypes/idunn';
import IdunnPoi from 'src/adapters/poi/idunn_poi';

export type DefaultRoadMapProps = {
  routeSteps: components['schemas']['RouteStep'][];
  destination: IdunnPoi;
  origin: IdunnPoi;
};

const DefaultRoadMap: React.FunctionComponent<DefaultRoadMapProps> = ({
  origin,
  destination,
  routeSteps,
}) => {
  return (
    <div className="itinerary_roadmap">
      <DefaultRoadMapPoint point={origin} onClick={() => fire('fit_map', origin)} />
      {routeSteps.map((step, index) => (
        <DefaultRoadMapStep
          key={index}
          step={step}
          onMouseOver={() => {
            fire('highlight_step', index);
          }}
          onMouseOut={() => {
            fire('unhighlight_step', index);
          }}
          onClick={() => {
            fire('zoom_step', step);
          }}
        />
      ))}
      <DefaultRoadMapPoint point={destination} onClick={() => fire('fit_map', destination)} />
    </div>
  );
};

export default DefaultRoadMap;
