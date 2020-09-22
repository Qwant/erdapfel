/* global _ */
import React from 'react';
import Telemetry from 'src/libs/telemetry';

const OsmContribution = ({ poi }) => {
  const [_osmKey, itemKind, itemId] = poi.id.split(':');
  const viewUrl = `https://www.openstreetmap.org/${itemKind}/${itemId}`;
  const editUrl = `https://www.openstreetmap.org/edit?editor=id&${itemKind}=${itemId}`;

  const sendTelemetryEvent = event => () => Telemetry.sendPoiEvent(poi, event);

  return <div className="osm_contribute">
    <div className="osm_contribute__logo" />
    <div className="osm_contribute__text_container">
      <p className="u-text--caption">
        {_('Qwant Maps uses OpenStreetMap data.')}
      </p>
      <a className="osm_contribute__link u-text--caption" href={viewUrl} rel="noopener noreferrer"
        target="_blank"
        onClick={sendTelemetryEvent('osm_view')}
      >
        {_('View')}
      </a>
      <a className="u-text--caption osm_contribute__link" href={editUrl} rel="noopener noreferrer"
        target="_blank"
        onClick={sendTelemetryEvent('osm_edit')}
      >
        {_('Edit')}
      </a>
    </div>
  </div>;
};

export default OsmContribution;
