import React from 'react';
import RoadMap from '../../RoutesList/Route/RoadMap';
import { CloseButton, Divider } from 'src/components/ui';
import { Box, Button, Flex } from '@qwant/qwant-ponents';
import RouteSummaryInfo from '../../RouteSummaryInfo';
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
  const { _ } = useI18n();

  return (
    <div className="mobile-route-details">
      <div className="mobile-route-details-header">
        <Box py="l" px="s">
          <Flex between>
            <RouteSummaryInfo route={route} vehicle={vehicle} />
            <CloseButton position="topRight" onClick={() => toggleDetails(id)} />
          </Flex>

          {vehicle !== 'publicTransport' && (
            <Button
              onClick={() => {
                openPreview(id);
              }}
              variant="primary-green"
              full
              mt="l"
            >
              <img className="u-mr-xxs" src="./statics/images/direction_icons/guide.svg" />
              <span className="u-firstCap">{_('step by step', 'direction')}</span>
            </Button>
          )}
        </Box>

        <Divider paddingTop={0} paddingBottom={0} />
      </div>

      <RoadMap route={route} origin={origin} destination={destination} vehicle={vehicle} />
    </div>
  );
};

export default MobileRouteDetails;
