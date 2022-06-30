/* globals _ */
import React from 'react';

import RouteVia from './RouteVia';
import RouteStartEndTimes from './RouteStartEndTimes';
import VehicleIcon from './VehicleIcon';
import { Badge } from 'src/components/ui';
import { formatDuration, formatDistance } from 'src/libs/route_utils';

const RouteWalkingTime = ({ route }) => {
  const walkingTime = route.legs
    .filter(leg => leg.mode === 'WALK')
    .reduce((sum, leg) => sum + leg.duration, 0);

  return (
    <span className="u-text--subtitle u-mr-s">
      <VehicleIcon vehicle="walking" fill="currentColor" height={11} />
      {formatDuration(walkingTime)}
    </span>
  );
};

const RouteSummaryInfo = ({ isFastest, route, vehicle }) => (
  <div>
    <div className="u-text--title u-mb-xxxs route-summary-info-duration">
      {formatDuration(route.duration)}
    </div>

    {vehicle === 'publicTransport' && (
      <RouteStartEndTimes className="u-mb-xs" start={route.start_time} end={route.end_time} />
    )}

    <RouteVia className="u-mb-xs" route={route} vehicle={vehicle} />

    {vehicle !== 'publicTransport' && (
      <Badge className="u-mr-xs">{formatDistance(route.distance)}</Badge>
    )}

    {vehicle === 'publicTransport' && <RouteWalkingTime route={route} />}

    {isFastest && <span className="u-text--subtitle">{_('Fastest route')}</span>}
  </div>
);
export default RouteSummaryInfo;
