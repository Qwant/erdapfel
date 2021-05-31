/* global _ */
import React from 'react';
import { Button } from 'src/components/ui';

const geoloc = e => {
  e.preventDefault();
  document.querySelector('.mapboxgl-ctrl-geolocate').click();
};

const zoomOut = e => {
  e.preventDefault();
  document.querySelector('.map_control_group__button__zoom.icon-minus').click();
};

const CategoryPanelError = ({ zoomIn }) => {
  const { title, message, action } = zoomIn
    ? {
        title: _('No results found.'),
        message: _('Please zoom in the map to see the results for this category.', 'categories'),
        action: (
          <Button onClick={geoloc} href="#">
            <span className="icon-pin_geoloc" /> {_('Search around my position', 'categories')}
          </Button>
        ),
      }
    : {
        title: _("Hmm, looks like a no-man's land 🙅‍♂️", 'categories'),
        message: _('We found no place matching your query in this area.', 'categories'),
        action: (
          <Button onClick={zoomOut} variant="tertiary">
            {_('Get some height', 'categories')}
          </Button>
        ),
      };

  return (
    <div className="category__panel__error u-center">
      <p className="u-mb-xs u-text--smallTitle">{title}</p>
      <p className="u-mb-s">{message}</p>
      {action}
    </div>
  );
};

export default CategoryPanelError;
