/* globals _ */
import React from 'react';

import RouteVia from './RouteVia';
import RouteStartEndTimes from './RouteStartEndTimes';
import { Badge } from 'src/components/ui';
import { formatDuration, formatDistance } from 'src/libs/route_utils';

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

    {isFastest && <span className="u-text--subtitle">{_('Fastest route')}</span>}
  </div>
);
export default RouteSummaryInfo;
