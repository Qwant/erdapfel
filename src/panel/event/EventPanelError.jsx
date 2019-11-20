/* global _ */
import React from 'react';

const geoloc = () => {
  document.querySelector('.mapboxgl-ctrl-geolocate').click();
};

const EventPanelError = ({ zoomIn }) => {
  return <div className="event__panel__error">
    <p>
      {zoomIn
        ? _('Please zoom in the map to see the results for this event.', 'events')
        : _('No results found. Please zoom out of the map.', 'events')
      }
    </p>
    <button onClick={geoloc}>
      <span className="icon-pin_geoloc" /> {_('Search around my position', 'events')}
    </button>
  </div>;
};

export default EventPanelError;
