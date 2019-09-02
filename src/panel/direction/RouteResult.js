/* globals _, fire, listen */
import React from 'react';
import PropTypes from 'prop-types';
import Route from './Route';
import { getVehicleIcon } from 'src/libs/route_utils';

export default class RouteResult extends React.Component {
  static propTypes = {
    routes: PropTypes.array,
    origin: PropTypes.string,
    vehicle: PropTypes.string,
    isLoading: PropTypes.bool,
    error: PropTypes.bool,
  }

  static defaultProps = {
    routes: [],
  }

  state = {
    activeRouteId: 0,
    activeDetails: false,
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

  toggleDetails = routeId => {
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

    return <React.Fragment>
      {this.props.routes.map((route, index) => <Route
        key={index}
        id={index}
        route={route.legs[0]}
        origin={this.props.origin}
        icon={getVehicleIcon(this.props.vehicle)}
        isActive={this.state.activeRouteId === index}
        showDetails={this.state.activeRouteId === index && this.state.activeDetails}
        toggleDetails={this.toggleDetails}
        selectRoute={this.selectRoute}
      />)}
    </React.Fragment>;
  }
}
