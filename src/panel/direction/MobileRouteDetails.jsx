/* global _ */
import React, { useRef } from 'react';
import RoadMap from './RoadMap';
import { Button, CloseButton, Divider, Flex } from 'src/components/ui';
import classnames from 'classnames';

import RouteSummaryInfo from './RouteSummaryInfo';

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
        <Flex alignItems="flex-start" justifyContent="space-between">
          <RouteSummaryInfo
            route={route}
            vehicle={vehicle}
          />
          <CloseButton onClick={() => toggleDetails(id)} />
        </Flex>

        {isPublicTransport &&
          <Button
            className="u-firstCap"
            onClick={() => { openPreview(id); }}
            variant="primary"
            style={{ width: '100%', marginTop: 20 }}
          >
            <Flex alignItems="center" justifyContent="center">
              <img className="u-mr-4" src="./statics/images/direction_icons/guide.svg" />
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
