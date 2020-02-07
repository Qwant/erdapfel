/* globals _, fire, listen */
import React from 'react';
import PropTypes from 'prop-types';
import Route from './Route';
import { getVehicleIcon } from 'src/libs/route_utils';
import classnames from 'classnames';
import { Item, ItemList } from 'src/components/ui/ItemList';

export default class RouteResult extends React.Component {
  static propTypes = {
    routes: PropTypes.array,
    origin: PropTypes.string,
    destination: PropTypes.string,
    vehicle: PropTypes.string,
    isLoading: PropTypes.bool,
    error: PropTypes.bool,
    openMobilePreview: PropTypes.func.isRequired,
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

  componentDidUpdate(prevProps) {
    if (this.props.routes.length !== prevProps.routes.length) {
      this.setState({ activeRouteId: 0 });
    }
  }

  selectRoute = routeId => {
    if (routeId === this.state.activeRouteId) {
      return;
    }
    fire('toggle_route', routeId);
    this.setState({ activeRouteId: routeId });
  }

  hoverRoute = (routeId, highlightMapRoute) => {
    if (routeId === this.state.activeRouteId) {
      return;
    }
    fire('toggle_route', highlightMapRoute ? routeId : this.state.activeRouteId);
  }

  toggleRouteDetails = routeId => {
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
    this.props.openMobilePreview(this.props.routes[routeId]);
  }

  render() {
    if (this.props.error) {
      return <div className="itinerary_no-result">
        <span className="icon-alert-triangle" />
        <div>{_('Qwant Maps found no results for this itinerary.')}</div>
      </div>;
    }

    if (this.props.isLoading) {
      return <div className="itinerary_result">
        <ItemList>
          <Item>
            <div className="itinerary_leg itinerary_leg--placeholder">
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
            </div>
          </Item>
        </ItemList>
      </div>;
    }

    return <div>
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
              isActive={this.state.activeRouteId === index}
              showDetails={this.state.activeRouteId === index && this.state.activeDetails}
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
    </div>;
  }
}
