import React from 'react';
import { formatDistance, getStepIcon } from 'src/libs/route_utils';
import RoadMapItem from './RoadMapItem';
import RoadMapIcon from './RoadMapIcon';

const RoadMapStep = ({ step, ...rest }) =>
  <RoadMapItem
    icon={<RoadMapIcon iconClass={getStepIcon(step)} />}
    distance={step.distance ? formatDistance(step.distance) : null}
    flex="flex-start"
    {...rest}
  >
    {step.maneuver.instruction}
  </RoadMapItem>;

export default RoadMapStep;
