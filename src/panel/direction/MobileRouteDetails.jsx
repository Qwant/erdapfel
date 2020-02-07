import React from 'react';
import RouteVia from './RouteVia';
import RoadMap from './RoadMap';
import { formatDuration } from 'src/libs/route_utils';

const MobileRouteDetails = ({ id, route, origin, destination, vehicle, toggleDetails }) => {
  return <div className="itinerary_legDetails">
    <div className="itinerary_legDetails_header">
      <button className="itinerary_legDetails_back" onClick={() => { toggleDetails(id); }}>
        <i className="icon-arrow-left" />
      </button>
      <RouteVia route={route} vehicle={vehicle} />
      <div className="itinerary_leg_duration">
        {formatDuration(route.duration)}
      </div>
    </div>
    <RoadMap
      route={route}
      origin={origin}
      destination={destination}
      vehicle={vehicle} />
    {vehicle === 'publicTransport' && <div className="itinerary_legDetails_source">
      <a href="https://combigo.com/">
        <img src="./statics/images/direction_icons/logo_combigo.svg" alt="" />
        Combigo
      </a>
    </div>}
  </div>;
};

export default MobileRouteDetails;
