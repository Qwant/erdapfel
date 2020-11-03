/* global _ */
import React from 'react';

const geoloc = e => {
  e.preventDefault();
  document.querySelector('.mapboxgl-ctrl-geolocate').click();
};

const CategoryPanelError = ({ zoomIn }) => {
  return (
    <div className="category__panel__error">
      <p className="u-mb-xs u-text--smallTitle">{_('No results found.')}</p>
      <p className="u-mb-l">
        {zoomIn
          ? _('Please zoom in the map to see the results for this category.', 'categories')
          : _('Please zoom out of the map.', 'categories')
        }
      </p>
      <a onClick={geoloc} href="#">
        <span className="icon-pin_geoloc" /> {_('Search around my position', 'categories')}
      </a>
    </div>
  );
};

export default CategoryPanelError;
