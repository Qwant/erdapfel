/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { listen } from 'src/libs/customEvents';
import { updateQueryString } from 'src/libs/url_utils';
import Telemetry from 'src/libs/telemetry';

import RoutesList from './RoutesList';

export default class RouteResult extends React.Component {
  static propTypes = {
    routes: PropTypes.array,
    origin: PropTypes.object,
    destination: PropTypes.object,
    vehicle: PropTypes.string,
    isLoading: PropTypes.bool,
    error: PropTypes.number,
    openMobilePreview: PropTypes.func.isRequired,
    activeRouteId: PropTypes.number,
  }

  static defaultProps = {
    routes: [],
  }

  state = {
    activeDetails: false,
  }

  componentDidMount() {
    listen('select_road_map', routeId => {
      this.selectRoute(routeId);
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.routes.length !== prevProps.routes.length) {
      this.updateUrl({ selected: this.props.activeRouteId });
    }
  }

  selectRoute = routeId => {
    if (routeId === this.props.activeRouteId) {
      return;
    }

    Telemetry.add(Telemetry.ITINERARY_ROUTE_SELECT);

    this.updateUrl({ selected: routeId });
  }

  updateUrl = queryObject => {
    const search = updateQueryString(queryObject);
    window.app.navigateTo('routes/' + search, {}, { replace: true });
  }

  toggleRouteDetails = routeId => {
    Telemetry.add(Telemetry.ITINERARY_ROUTE_TOGGLE_DETAILS);
    if (this.props.activeRouteId === routeId) {
      this.setState(prevState => ({ activeDetails: !prevState.activeDetails }));
    } else {
      this.setState({
        activeDetails: true,
      });
    }
  }

  openPreview = routeId => {
    this.props.openMobilePreview(this.props.routes[routeId]);
  }

  render() {
    if (this.props.error !== 0) {
      return <div className="itinerary_no-result">
        <span className="icon-alert-triangle" />
        <div>{
          this.props.error >= 500 && this.props.error < 600
            ? _('The service is temporarily unavailable, please try again later.', 'direction')
            : _('Qwant Maps found no results for this itinerary.', 'direction')
        }</div>
        {
          this.props.vehicle === 'publicTransport' &&
          <div>{
            _(
              'We are currently testing public transport mode in a restricted set of cities.',
              'direction'
            )
          }</div>
        }
      </div>;
    }

    return <>
      <div className={classnames('itinerary_result', {
        'itinerary_result--publicTransport': this.props.vehicle === 'publicTransport',
      })}>
        <RoutesList
          isLoading={this.props.isLoading}
          routes={this.props.routes}
          activeRouteId={this.props.activeRouteId}
          origin={this.props.origin}
          destination={this.props.destination}
          vehicle={this.props.vehicle}
          activeDetails={this.state.activeDetails}
          toggleRouteDetails={this.toggleRouteDetails}
          openPreview={this.openPreview}
          selectRoute={this.selectRoute}
        />
      </div>
      {this.props.vehicle === 'publicTransport' && this.props.routes.length > 0 &&
      <div className="itinerary_source">
        <a href="https://combigo.com/">
          <img src="./statics/images/direction_icons/logo_combigo.svg" alt="" />
          Combigo
        </a>
      </div>}
    </>;
  }
}
