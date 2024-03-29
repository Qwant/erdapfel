/* globals _ */
import React from 'react';

import RouteVia from './RouteVia';
import RouteStartEndTimes from './RouteStartEndTimes';
import VehicleIcon from '../VehicleIcon';
import { Badge } from 'src/components/ui';
import { formatDuration, formatDistance } from 'src/libs/route_utils';

const RouteWalkingTime = ({ route }) => {
  const walkingTime = route.legs
    .filter(leg => leg.mode === 'WALK')
    .reduce((sum, leg) => sum + leg.duration, 0);

  return (
    <span className="u-text--subtitle u-mr-s">
      <VehicleIcon vehicle="walking" fill="currentColor" width={12} height={12} />
      <span className="u-ml-xxs">{formatDuration(walkingTime)}</span>
    </span>
  );
};

const RouteSummaryInfo = ({ isFastest, route, vehicle }) => (
  <div>
    <div className="u-text--title route-summary-info-duration">
      {formatDuration(route.duration)}
    </div>

    {vehicle === 'publicTransport' && (
      <RouteStartEndTimes className="u-mb-xs" start={route.start_time} end={route.end_time} />
    )}

    <RouteVia className="u-mb-xxs" route={route} vehicle={vehicle} />

    {vehicle !== 'publicTransport' && (
      <Badge className="u-mr-s">{formatDistance(route.distance)}</Badge>
    )}

    {vehicle === 'publicTransport' && <RouteWalkingTime route={route} />}

    {isFastest && <span className="u-text--subtitle">{_('Fastest route')}</span>}
  </div>
);
export default RouteSummaryInfo;
