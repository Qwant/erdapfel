import React, { useRef } from 'react';
import RoadMap from './RoadMap';
import { CloseButton, Divider } from 'src/components/ui';
import classnames from 'classnames';
import { Button, Flex } from '@qwant/qwant-ponents';
import RouteSummaryInfo from './RouteSummaryInfo';
import { useI18n } from 'src/hooks';

const MobileRouteDetails = ({
  id,
  route,
  origin,
  destination,
  vehicle,
  toggleDetails,
  openPreview,
}) => {
  const panelElement = useRef(null);
  const { _ } = useI18n();

  return (
    <div ref={panelElement} className={classnames('mobile-route-details')}>
      <div className="mobile-route-details-header">
        <div className="mobile-route-details-header-content">
          <Flex between>
            <RouteSummaryInfo route={route} vehicle={vehicle} />
            <CloseButton position="topRight" onClick={() => toggleDetails(id)} />
          </Flex>

          {vehicle !== 'publicTransport' && (
            <Button
              onClick={() => {
                openPreview(id);
              }}
              variant="primary"
              style={{ width: '100%', marginTop: 20 }}
            >
              <img className="u-mr-xxs" src="./statics/images/direction_icons/guide.svg" />
              <span className="u-firstCap">{_('step by step', 'direction')}</span>
            </Button>
          )}
        </div>

        <Divider paddingTop={0} paddingBottom={0} />
      </div>

      <RoadMap route={route} origin={origin} destination={destination} vehicle={vehicle} />
    </div>
  );
};

export default MobileRouteDetails;
