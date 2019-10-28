/* global _ */
import React from 'react';

const geoloc = () => {
  document.querySelector('.mapboxgl-ctrl-geolocate').click();
};

const CategoryPanelError = ({ zoomIn }) => {
  return <div className="category__panel__error">
    <p>
      {zoomIn
        ? _('Please zoom in the map to see the results for this category.', 'categories')
        : _('No results found. Please zoom out of the map.', 'categories')
      }
    </p>
    <button onClick={geoloc}>
      <span className="icon-pin_geoloc" /> {_('Search around my position', 'categories')}
    </button>
  </div>;
};

export default CategoryPanelError;
