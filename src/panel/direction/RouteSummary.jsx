/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Flex } from 'src/components/ui';

import RouteSummaryInfo from './RouteSummaryInfo';

const RouteSummary = (
  { id, route, vehicle, toggleDetails, selectRoute, isActive, showDetails }
) => {
  const onClickDetails = event => {
    event.stopPropagation();
    toggleDetails(id);
  };

  return <Flex
    className="itinerary_leg_summary"
    justifyContent="space-between"
    alignItems="flex-end"
    onClick={() => { selectRoute(id); }}
  >
    <RouteSummaryInfo
      isFastest={id === 0}
      route={route}
      vehicle={vehicle}
    />

    {isActive &&
      <Button
        className="itinerary_leg_detailsBtn u-firstCap"
        onClick={onClickDetails}
        icon={showDetails ? null : 'icon_list'}
        variant={showDetails ? 'tertiary' : 'secondary'}
      >
        {showDetails
          ? _('See less', 'direction')
          : _('Details', 'direction')
        }
      </Button>
    }
  </Flex>;
};

RouteSummary.propTypes = {
  id: PropTypes.number.isRequired,
  route: PropTypes.object.isRequired,
  vehicle: PropTypes.string.isRequired,
  toggleDetails: PropTypes.func.isRequired,
  selectRoute: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  showDetails: PropTypes.bool.isRequired,
};

export default RouteSummary;
