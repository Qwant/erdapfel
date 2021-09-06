import React from 'react';
import Telemetry from 'src/libs/telemetry';
import { Flex } from 'src/components/ui';
import { isFromOSM, isFromPagesJaunes } from 'src/libs/pois';
import classnames from 'classnames';
import { useI18n } from 'src/hooks';

const Contribution = ({ poi }) => {
  const { _ } = useI18n();

  if ((!isFromOSM(poi) && !isFromPagesJaunes(poi)) || !poi.meta) {
    return null;
  }

  const { source_url, contribute_url } = poi.meta;
  const sendTelemetryEvent = event => () => Telemetry.sendPoiEvent(poi, event);
  return (
    <Flex
      className={classnames('contribute', isFromOSM(poi) ? 'contribute--osm' : 'contribute--pj')}
    >
      <div className="contribute__logo" />
      <div className="u-text--caption">
        <p>
          {isFromOSM(poi)
            ? _('Qwant Maps uses OpenStreetMap data.')
            : `${_('In partnership with')} PagesJaunes.`}
        </p>
        <div>
          <a
            className="u-mr-xl"
            href={source_url}
            rel="noopener noreferrer"
            target="_blank"
            onClick={sendTelemetryEvent(isFromOSM(poi) ? 'osm_view' : 'pj_view')}
          >
            {_('View')}
          </a>
          <a
            href={contribute_url}
            rel="noopener noreferrer"
            target="_blank"
            onClick={sendTelemetryEvent(isFromOSM(poi) ? 'osm_edit' : 'pj_edit')}
          >
            {_('Edit')}
          </a>
        </div>
      </div>
    </Flex>
  );
};

export default Contribution;
