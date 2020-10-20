import React from 'react';

import RouteVia from './RouteVia';
import { Badge, Flex } from 'src/components/ui';
import { formatDuration, formatDistance } from 'src/libs/route_utils';

const RouteSummaryInfo = ({ route, vehicle }) =>
  <div>
    <Flex alignItems="center" justifyContent="space-between" className="u-text--title">
      {formatDuration(route.duration)}
    </Flex>

    <RouteVia className="u-mb-8" route={route} vehicle={vehicle} />
    <Badge>
      {formatDistance(route.distance)}
    </Badge>
  </div>
;

export default RouteSummaryInfo;
