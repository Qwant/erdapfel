/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import Telemetry from '../../libs/telemetry';
import { openShareModal } from 'src/modals/ShareModal';
import { formatDuration, formatDistance, getVehicleIcon } from 'src/libs/route_utils';

export default class RouteSummary extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    route: PropTypes.object.isRequired,
    vehicle: PropTypes.string.isRequired,
    openDetails: PropTypes.func.isRequired,
    openPreview: PropTypes.func.isRequired,
    selectRoute: PropTypes.func.isRequired,
  }

  onClick = () => {
    this.props.selectRoute(this.props.id);
  }

  onClickDetails = event => {
    event.stopPropagation();
    this.props.openDetails(this.props.id);
  }

  onClickShare = () => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    openShareModal(window.location);
  }

  onClickPreview = () => {
    this.props.openPreview(this.props.id);
  }

  render() {
    const { route, vehicle } = this.props;

    return <div className="itinerary_leg_summary" onClick={this.onClick}>
      <div className={`itinerary_leg_icon ${getVehicleIcon(vehicle)}`} />
      <div className="itinerary_leg_via">
        <div className="itinerary_leg_via_title">
          {_('Via', 'direction')} { route.summary.replace(/^(.*), (.*)$/, '$1')}
        </div>
        <div className="itinerary_leg_via_details" onClick={this.onClickDetails}>
          <i className="itinerary_leg_via_details_icon" />
          {_('DETAILS', 'direction')}
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
      <div className="itinerary_panel__item__share" onClick={this.onClickShare}>
        <i className="icon-share-2" />
      </div>
      <div className="itinerary_leg_preview" onClick={this.onClickPreview}>
        <span className="itinerary_leg_preview_icon icon-navigation" />
        {_('PREVIEW', 'direction')}
      </div>
    </div>;
  }
}
