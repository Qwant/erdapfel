import React from 'react';
import { Button } from '@qwant/qwant-ponents';
import { IconGeoloc } from 'src/components/ui/icons';
import { useI18n } from 'src/hooks';

const geoloc = e => {
  e.preventDefault();
  document.querySelector('.mapboxgl-ctrl-geolocate').click();
};

const zoomOut = e => {
  e.preventDefault();
  document.querySelector('.map-button--zoomOut').click();
};

const CategoryPanelError = ({ zoomIn }) => {
  const { _ } = useI18n();

  const { title, message, action } = zoomIn
    ? {
        title: _('No results found.'),
        message: _('Please zoom in the map to see the results for this category.', 'categories'),
        action: (
          <Button onClick={geoloc} variant="secondary">
            <IconGeoloc fill="currentColor" />
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
