/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import { formatDuration, formatDistance, getVehicleIcon } from 'src/libs/route_utils';
import RouteVia from './RouteVia';
import Button from 'src/components/ui/Button';
import ShareMenu from 'src/components/ui/ShareMenu';

export default class RouteSummary extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    route: PropTypes.object.isRequired,
    vehicle: PropTypes.string.isRequired,
    toggleDetails: PropTypes.func.isRequired,
    openPreview: PropTypes.func.isRequired,
    selectRoute: PropTypes.func.isRequired,
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

  render() {
    const { route, vehicle } = this.props;

    return <div className="itinerary_leg_summary" onClick={this.onClick}>
      <div className={`itinerary_leg_icon ${getVehicleIcon(vehicle)}`} />
      <div className="itinerary_leg_via">
        <RouteVia route={route} vehicle={vehicle} />
        <div className="itinerary_leg_via_details" onClick={this.onClickDetails}>
          <i className="itinerary_leg_via_details_icon" />
          {_('Details', 'direction')}
        </div>
      </div>
      <div className="itinerary_leg_info">
        <div className="itinerary_leg_duration">
          {formatDuration(route.duration)}
        </div>
        <div className="itinerary_leg_distance">
          {formatDistance(route.distance)}
        </div>
      </div>
      <ShareMenu url={window.location.toString()} scrollableParent=".panel-content">
        {openMenu => <div
          className="itinerary_panel__item__share"
          title={_('Share', 'direction')}
          onClick={openMenu}
        >
          <i className="icon-share-2" />
        </div>}
      </ShareMenu>
      <div className="itinerary_leg_mobileActions">
        <Button className="itinerary_leg_detailsBtn" onClick={this.onClickDetails} icon="icon_list">
          {_('Details', 'direction')}
        </Button>
        <ShareMenu url={window.location.toString()} scrollableParent=".panel-content">
          {openMenu => <Button title={_('Share', 'direction')} onClick={openMenu} icon="share-2" />}
        </ShareMenu>
      </div>
    </div>;
  }
}
