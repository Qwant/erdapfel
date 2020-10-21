/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import { getVehicleIcon } from 'src/libs/route_utils';
import { Button, Flex } from 'src/components/ui';
import ShareMenu from 'src/components/ui/ShareMenu';
import Telemetry from 'src/libs/telemetry';

import RouteSummaryInfo from './RouteSummaryInfo';

export default class RouteSummary extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    route: PropTypes.object.isRequired,
    vehicle: PropTypes.string.isRequired,
    toggleDetails: PropTypes.func.isRequired,
    openPreview: PropTypes.func.isRequired,
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

  onClickPreview = () => {
    this.props.openPreview(this.props.id);
  }

  onShareClick = (e, handler) => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    return handler(e);
  }

  render() {
    const { route, vehicle, isActive, showDetails } = this.props;

    return <div className="itinerary_leg_summary" onClick={this.onClick}>

      <Flex>
        <div className={`itinerary_leg_icon ${getVehicleIcon(vehicle)}`} />
        <RouteSummaryInfo
          route={route}
          vehicle={vehicle}
        />
      </Flex>

      {isActive &&
        <Flex className="itinerary_leg_details-buttons">
          <Button
            className="itinerary_leg_detailsBtn u-mr-8 u-firstCap"
            onClick={this.onClickDetails}
            icon={showDetails ? null : 'icon_list'}
            variant={showDetails ? 'tertiary' : 'secondary'}
          >
            {showDetails
              ? _('See less', 'direction')
              : _('Details', 'direction')
            }
          </Button>

          <ShareMenu url={window.location.toString()} scrollableParent=".panel-content">
            {openMenu => <Button
              title={_('Share', 'direction')}
              onClick={e => this.onShareClick(e, openMenu)}
              icon="share-2"
            />}
          </ShareMenu>
        </Flex>
      }
    </div>;
  }
}
