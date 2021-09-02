/* global _ */
import React from 'react';
import Telemetry from 'src/libs/telemetry';
import { isFromPagesJaunes, isFromOSM } from 'src/libs/pois';
import classnames from 'classnames';

const Contribution = ({ poi }) => {
  if (!poi.meta) {
    return null;
  }

  const { source_url, contribute_url } = poi.meta;
  const sendTelemetryEvent = event => () => Telemetry.sendPoiEvent(poi, event);
  return (
    <div
      className={classnames('contribute', isFromOSM(poi) ? 'contribute--osm' : 'contribute--pj')}
    >
      {isFromOSM(poi) && <div className="contribute__logo-osm" />}
      <div className="contribute__text_container">
        {isFromOSM(poi) && (
          <p className="u-text--caption">{_('Qwant Maps uses OpenStreetMap data.')}</p>
        )}
        {isFromPagesJaunes(poi) && (
          <p className="u-text--caption">{_('Qwant Maps uses PagesJaunes data.')}</p>
        )}
        <a
          className="contribute__link u-text--caption"
          href={source_url}
          rel="noopener noreferrer"
          target="_blank"
          onClick={sendTelemetryEvent(isFromOSM(poi) ? 'osm_view' : 'pj_view')}
        >
          {_('View')}
        </a>
        <a
          className="u-text--caption contribute__link"
          href={contribute_url}
          rel="noopener noreferrer"
          target="_blank"
          onClick={sendTelemetryEvent(isFromOSM(poi) ? 'osm_edit' : 'pj_edit')}
        >
          {_('Edit')}
        </a>
      </div>
    </div>
  );
};

export default Contribution;
