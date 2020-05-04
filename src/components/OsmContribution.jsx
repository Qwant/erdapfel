/* global _ */
import React from 'react';

const OsmContribution = ({ poi }) => {
  const [_osmKey, itemKind, itemId] = poi.id.split(':');
  const viewUrl = `https://www.openstreetmap.org/${itemKind}/${itemId}`;
  const editUrl = `https://www.openstreetmap.org/edit?editor=id&${itemKind}=${itemId}`;

  return <div className="osm_contribute">
    <div className="osm_contribute__logo" />
    <div className="osm_contribute__text_container">
      <p className="u-text--caption">
        {_('Qwant Maps uses OpenStreetMap data.')}
      </p>
      <a className="u-text--caption osm_contribute__link" href={viewUrl} rel="noopener noreferrer"
        target="_blank">
        <i className="icon-chevrons-right osm_contribute__icon" />
        <span className="osm_contribute__about">{_('View')}</span>
      </a>
      <a className="u-text--caption osm_contribute__link" href={editUrl} rel="noopener noreferrer"
        target="_blank">
        <i className="icon-chevrons-right osm_contribute__icon edit" />
        <span className="osm_contribute__about">{_('Edit')}</span>
      </a>
    </div>
  </div>;
};

export default OsmContribution;
