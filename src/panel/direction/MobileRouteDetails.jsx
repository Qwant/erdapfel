/* global _ */
import React, { useState, useRef, useEffect } from 'react';
import RouteVia from './RouteVia';
import RoadMap from './RoadMap';
import Button from 'src/components/ui/Button';
import { formatDuration } from 'src/libs/route_utils';
import classnames from 'classnames';
import throttle from 'lodash.throttle';

const MobileRouteDetails =
({ id, route, origin, destination, vehicle, toggleDetails, openPreview }) => {
  const panelElement = useRef(null);
  const [scrolledDown, setScrolledDown] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrolledDown(panelElement.current.scrollTop > 0);
    }, 100, { leading: true, trailing: true });
    panelElement.current.addEventListener('scroll', handleScroll, { passive: true });
    return () => panelElement.current.removeEventListener('scroll', handleScroll);
  });

  return <div
    ref={panelElement}
    className={classnames('itinerary_legDetails', {
      ['itinerary_legDetails__scrolled']: scrolledDown,
    })}
  >
    <div className="itinerary_legDetails_header">
      <button className="itinerary_legDetails_back" onClick={() => { toggleDetails(id); }}>
        <i className="icon-arrow-left" />
      </button>
      <RouteVia route={route} vehicle={vehicle} />
      <div className="itinerary_leg_duration">
        {formatDuration(route.duration)}
      </div>
    </div>
    <div className="itinerary_legDetails_title">
      <div className="u-bold">{_('Details', 'direction')}</div>
      {vehicle !== 'publicTransport' && <Button
        onClick={() => { openPreview(id); }}
        icon="chevrons-right"
      >
        {_('Preview', 'direction')}
      </Button>}
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
