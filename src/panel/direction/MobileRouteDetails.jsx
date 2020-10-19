/* global _ */
import React, { useRef } from 'react';
import RouteVia from './RouteVia';
import RoadMap from './RoadMap';
import { Badge, Button, CloseButton, Divider, Flex } from 'src/components/ui';
import { formatDuration, formatDistance } from 'src/libs/route_utils';
import classnames from 'classnames';

const MobileRouteDetails =
({ id, route, origin, destination, vehicle, toggleDetails, openPreview }) => {
  const panelElement = useRef(null);
  const isPublicTransport = vehicle !== 'publicTransport';

  return <div
    onTouchStart={e => e.stopPropagation()}
    ref={panelElement}
    className={classnames('mobile-route-details')}
  >
    <div className="mobile-route-details-header">
      <div className="mobile-route-details-header-content">
        <Flex alignItems="center" justifyContent="space-between" className="u-text--title">
          {formatDuration(route.duration)}
          <CloseButton onClick={() => { toggleDetails(id); }} />
        </Flex>

        <RouteVia className="u-mb-8" route={route} vehicle={vehicle} />
        <Badge className={isPublicTransport ? 'u-mb-20' : ''}>
          {formatDistance(route.distance)}
        </Badge>

        {isPublicTransport &&
          <Button
            className="u-firstCap"
            onClick={() => { openPreview(id); }}
            variant="primary"
            style={{ width: '100%' }}
          >
            <Flex alignItems="center" justifyContent="center">
              <img className="u-mr-4" src="/statics/images/direction_icons/guide.svg" />
              <span className="u-firstCap">{_('step by step', 'direction')}</span>
            </Flex>
          </Button>
        }
      </div>

      <Divider paddingTop={0} paddingBottom={0}/>
    </div>

    <RoadMap
      route={route}
      origin={origin}
      destination={destination}
      vehicle={vehicle} />
    {vehicle === 'publicTransport' && <div className="mobile-route-details-source">
      <a href="https://combigo.com/">
        <img src="./statics/images/direction_icons/logo_combigo.svg" alt="" />
        Combigo
      </a>
    </div>}
  </div>;
};

export default MobileRouteDetails;
