import React from 'react';
import { formatDistance, getStepIcon } from 'src/libs/route_utils';
import DefaultRoadMapItem from '../DefaultRoadMapItem';
import DefaultRoadMapIcon from '../DefaultRoadMapIcon';
import { walkingManeuver } from 'src/libs/route_utils';

const DefaultRoadMapStep = ({ step, ...rest }) => (
  <DefaultRoadMapItem
    icon={<DefaultRoadMapIcon iconClass={getStepIcon(step)} />}
    distance={step.distance ? formatDistance(step.distance) : null}
    alignTop
    {...rest}
  >
    {step.maneuver.instruction || walkingManeuver(step.maneuver)}
  </DefaultRoadMapItem>
);

export default DefaultRoadMapStep;
