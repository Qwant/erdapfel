/* globals _ */
import React from 'react';
import { formatDistance, getStepIcon } from 'src/libs/route_utils';
import RoadMapItem from '../RoadMapItem';
import RoadMapIcon from '../RoadMapIcon';

const stringifyManeuver = maneuver => {
  const stringifyModifier = {
    'sharp left': _('Turn left', 'direction'),
    left: _('Turn left', 'direction'),
    'slight left': _('Keep left', 'direction'),
    straight: _('Walk', 'direction'),
    'slight right': _('Keep right', 'direction'),
    right: _('Turn right', 'direction'),
    'sharp right': _('Turn right', 'direction'),
    uturn: _('Turn back', 'direction'),
  };

  const context = {
    modifier: stringifyModifier[maneuver.modifier],
    name: maneuver.detail.name,
  };

  return maneuver.detail.name ? _('{modifier} on {name}', 'direction', context) : context.modifier;
};

const RoadMapStep = ({ step, ...rest }) => (
  <RoadMapItem
    icon={<RoadMapIcon iconClass={getStepIcon(step)} />}
    distance={step.distance ? formatDistance(step.distance) : null}
    alignTop
    {...rest}
  >
    {step.maneuver.instruction || stringifyManeuver(step.maneuver)}
  </RoadMapItem>
);

export default RoadMapStep;
