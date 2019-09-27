/* globals _, fire, listen */
import React from 'react';
import PropTypes from 'prop-types';
import Route from './Route';
import { getVehicleIcon } from 'src/libs/route_utils';
import MobileRoadMapPreview from './MobileRoadMapPreview';

export default class RouteResult extends React.Component {
  static propTypes = {
    routes: PropTypes.array,
    origin: PropTypes.string,
    vehicle: PropTypes.string,
    isLoading: PropTypes.bool,
    error: PropTypes.bool,
    // we need this callback for now because the non-React mobile layout needs to know if it's open
    // to decide if the "back" action only closes the preview or the whole direction UI
    // @TODO: implement this behavior with React Router later
    onOpenMobilePreview: PropTypes.func,
  }

  static defaultProps = {
    routes: [],
  }

  state = {
    activeRouteId: 0,
    activeDetails: false,
    previewRoute: null,
  }

  componentDidMount() {
    listen('select_road_map', routeId => {
      this.selectRoute(routeId);
    });
  }

  selectRoute = routeId => {
    fire('toggle_route', routeId);
    this.setState({ activeRouteId: routeId });
  }

  openRouteDetails = routeId => {
    if (this.state.activeRouteId === routeId) {
      this.setState(prevState => ({ activeDetails: !prevState.activeDetails }));
    } else {
      fire('toggle_route', routeId);
      this.setState({
        activeRouteId: routeId,
        activeDetails: true,
      });
    }
  }

  openPreview = routeId => {
    fire('show_marker_steps');
    this.props.onOpenMobilePreview();
    this.setState({
      previewRoute: this.props.routes[routeId],
    });
  }

  render() {
    if (this.props.error) {
      return <div className="itinerary_no-result">
        <span className="icon-alert-triangle" />
        <div>{_('Qwant Maps found no results for this itinerary.')}</div>
      </div>;
    }

    if (this.props.isLoading) {
      return <div className="itinerary_leg itinerary_leg--placeholder">
        <div className="itinerary_leg_summary">
          <div className={`itinerary_leg_icon ${getVehicleIcon(this.props.vehicle)}`} />
          <div className="itinerary_leg_via">
            <div className="itinerary_placeholder-box" style={{ width: '133px' }} />
            <div className="itinerary_placeholder-box" style={{ width: '165px' }} />
            <div className="itinerary_placeholder-box" style={{ width: '70px' }} />
          </div>
          <div className="itinerary_leg_info">
            <div className="itinerary_leg_duration">
              <div className="itinerary_placeholder-box" style={{ width: '47px' }} />
            </div>
            <div className="itinerary_leg_distance">
              <div className="itinerary_placeholder-box" style={{ width: '59px' }} />
            </div>
          </div>
        </div>
      </div>;
    }

    if (this.state.previewRoute) {
      return <MobileRoadMapPreview steps={this.state.previewRoute.legs[0].steps} />;
    }

    return this.props.routes.map((route, index) => <Route
      key={index}
      id={index}
      route={route.legs[0]}
      origin={this.props.origin}
      icon={getVehicleIcon(this.props.vehicle)}
      isActive={this.state.activeRouteId === index}
      showDetails={this.state.activeRouteId === index && this.state.activeDetails}
      openDetails={this.openRouteDetails}
      openPreview={this.openPreview}
      selectRoute={this.selectRoute}
    />);
  }
}
