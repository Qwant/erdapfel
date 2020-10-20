import React from 'react';

import RouteVia from './RouteVia';
import { Badge, CloseButton, Flex } from 'src/components/ui';
import { formatDuration, formatDistance } from 'src/libs/route_utils';

const RouteSummaryInfo = ({ route, vehicle, onClose }) =>
  <div>
    <Flex alignItems="center" justifyContent="space-between" className="u-text--title">
      {formatDuration(route.duration)}
      {onClose && <CloseButton onClick={onClose} />}
    </Flex>

    <RouteVia className="u-mb-8" route={route} vehicle={vehicle} />
    <Badge>
      {formatDistance(route.distance)}
    </Badge>
  </div>
;

export default RouteSummaryInfo;
