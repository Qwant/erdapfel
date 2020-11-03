/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import Route from './Route';
import classnames from 'classnames';
import { Item, ItemList } from 'src/components/ui/ItemList';
import PlaceholderText from 'src/components/ui/PlaceholderText';
import { fire, listen } from 'src/libs/customEvents';
import { updateQueryString } from 'src/libs/url_utils';
import Telemetry from 'src/libs/telemetry';

export default class RouteResult extends React.Component {
  static propTypes = {
    routes: PropTypes.array,
    origin: PropTypes.object,
    destination: PropTypes.object,
    vehicle: PropTypes.string,
    isLoading: PropTypes.bool,
    error: PropTypes.number,
    openMobilePreview: PropTypes.func.isRequired,
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

  selectRoute = routeId => {
    if (routeId === this.props.selected) {
      return;
    }

    Telemetry.add(Telemetry.ITINERARY_ROUTE_SELECT);
    fire('set_main_route', { routeId, fitView: true });

    const search = updateQueryString({ selected: routeId });
    window.app.navigateTo('routes/' + search, {}, { replace: true });
  }

  hoverRoute = (routeId, highlightMapRoute) => {
    if (routeId === this.props.selected) {
      return;
    }
    fire('set_main_route', { routeId: highlightMapRoute ? routeId : this.props.selected });
  }

  toggleRouteDetails = routeId => {
    Telemetry.add(Telemetry.ITINERARY_ROUTE_TOGGLE_DETAILS);
    if (this.props.selected === routeId) {
      this.setState(prevState => ({ activeDetails: !prevState.activeDetails }));
    } else {
      fire('set_main_route', { routeId, fitView: true });
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

    if (this.props.isLoading) {
      return <div className="itinerary_result">
        <ItemList>
          <Item>
            <div className="itinerary_leg itinerary_leg--placeholder">
              <div className="itinerary_leg_summary">
                <div className="itinerary_leg_via">
                  <div className="routeVia">
                    <PlaceholderText length={17} />
                  </div>
                  <PlaceholderText length={10} />
                </div>
                <div>
                  <PlaceholderText length={5} />
                  <PlaceholderText length={7} />
                </div>
              </div>
            </div>
          </Item>
        </ItemList>
      </div>;
    }

    return <>
      <div className={classnames('itinerary_result', {
        'itinerary_result--publicTransport': this.props.vehicle === 'publicTransport',
      })}>
        <ItemList>
          {this.props.routes.map((route, index) => <Item key={index}>
            <Route
              id={index}
              route={route}
              origin={this.props.origin}
              destination={this.props.destination}
              vehicle={this.props.vehicle}
              isActive={this.props.selected === index}
              showDetails={this.props.selected === index && this.state.activeDetails}
              toggleDetails={this.toggleRouteDetails}
              openPreview={this.openPreview}
              selectRoute={this.selectRoute}
              hoverRoute={this.hoverRoute}
            />
          </Item>)}
        </ItemList>
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
