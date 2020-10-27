import React from 'react';
import { formatDistance, getStepIcon } from 'src/libs/route_utils';
import RoadMapItem from './RoadMapItem';

const RoadMapStep = ({ step, ...rest }) =>
  <RoadMapItem
    iconClass={getStepIcon(step)}
    distance={step.distance ? formatDistance(step.distance) : null}
    {...rest}
  >
    {step.maneuver.instruction}
  </RoadMapItem>;

export default RoadMapStep;
