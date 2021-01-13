/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Flex } from 'src/components/ui';
import Telemetry from 'src/libs/telemetry';

import RouteSummaryInfo from './RouteSummaryInfo';

export default class RouteSummary extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    route: PropTypes.object.isRequired,
    vehicle: PropTypes.string.isRequired,
    toggleDetails: PropTypes.func.isRequired,
    selectRoute: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    showDetails: PropTypes.bool.isRequired,
  }

  onClick = () => {
    this.props.selectRoute(this.props.id);
  }

  onClickDetails = event => {
    event.stopPropagation();
    this.props.toggleDetails(this.props.id);
  }

  onShareClick = (e, handler) => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    return handler(e);
  }

  render() {
    const { id, route, isActive, showDetails, vehicle } = this.props;

    return <Flex
      className="itinerary_leg_summary"
      justifyContent="space-between"
      alignItems="flex-end"
      onClick={this.onClick}
    >
      <RouteSummaryInfo
        isFastest={id === 0}
        route={route}
        vehicle={vehicle}
      />

      {isActive &&
        <Button
          className="itinerary_leg_detailsBtn u-firstCap"
          onClick={this.onClickDetails}
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
  }
}
