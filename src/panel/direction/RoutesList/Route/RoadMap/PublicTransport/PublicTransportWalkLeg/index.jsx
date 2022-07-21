/* global _ */
import React, { useState } from 'react';
import { formatDistance, formatDuration } from 'src/libs/route_utils';
import PublicTransportRoadMapItem from '../PublicTransportRoadMapItem';
import RoadMapIcon from '../../RoadMapIcon';
import LegLine from '../../LegLine';
import cx from 'classnames';
import { Chevron } from 'src/components/ui';

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

const PublicTransportWalkLeg = ({ leg }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const summary = _('Walk on {walkDistance}', 'direction', {
    walkDistance: formatDistance(leg.distance),
  });
  const hasSteps = leg.steps.length > 1;

  return (
    <PublicTransportRoadMapItem
      icon={<RoadMapIcon iconClass="walk" />}
      className={cx(
        'itinerary_roadmap_item--walk',
        !hasSteps && 'itinerary_roadmap_item--no-hover'
      )}
      line={<LegLine mode="WALK" />}
      distance={formatDuration(leg.duration)}
      type="WALK"
    >
      <div
        className={cx('itinerary_roadmap_item_summary', {
          'itinerary_roadmap_item_summary--openable': hasSteps,
        })}
        onClick={() => {
          if (hasSteps) {
            setDetailsOpen(!detailsOpen);
          }
        }}
      >
        <div>{summary}</div>
        {hasSteps && <Chevron up={detailsOpen} />}
      </div>
      {detailsOpen && (
        <div className="itinerary_roadmap_substeps">
          {leg.steps.map((step, index) => (
            <div key={index} className="itinerary_roadmap_substep">
              <div>{step.maneuver.instruction || stringifyManeuver(step.maneuver)}</div>
            </div>
          ))}
        </div>
      )}
    </PublicTransportRoadMapItem>
  );
};

export default PublicTransportWalkLeg;
