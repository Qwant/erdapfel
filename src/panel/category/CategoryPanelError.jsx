/* global _ */
import React from 'react';
import { Button } from 'src/components/ui';
import { IconGeoloc } from 'src/components/ui/icons';

const geoloc = e => {
  e.preventDefault();
  document.querySelector('.mapboxgl-ctrl-geolocate').click();
};

const zoomOut = e => {
  e.preventDefault();
  document.querySelector('.map-button--zoomOut').click();
};

const CategoryPanelError = ({ zoomIn }) => {
  const { title, message, action } = zoomIn
    ? {
        title: _('No results found.'),
        message: _('Please zoom in the map to see the results for this category.', 'categories'),
        action: (
          <Button onClick={geoloc} href="#" icon={<IconGeoloc width={16} fill="currentColor" />}>
            {_('Search around my position', 'categories')}
          </Button>
        ),
      }
    : {
        title: _("Hmm, looks like a no-man's land 🏜️", 'categories'),
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
