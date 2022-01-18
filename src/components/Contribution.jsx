import React from 'react';
import Telemetry from 'src/libs/telemetry';
import { Flex } from '@qwant/qwant-ponents';
import { isFromOSM, isFromPagesJaunes, isFromTripAdvisor } from 'src/libs/pois';
import classnames from 'classnames';
import { useI18n } from 'src/hooks';

const eventName = (poi, suffix) => {
  if (isFromOSM(poi)) return `osm_${suffix}`;
  if (isFromTripAdvisor(poi)) return `ta_${suffix}`;
  if (isFromPagesJaunes(poi)) return `pj_${suffix}`;
};

const sentenceFor = (poi, _) => {
  if (isFromOSM(poi)) return _('Qwant Maps uses OpenStreetMap data.');
  if (isFromTripAdvisor(poi)) return `${_('In partnership with')} TripAdvisor.`;
  if (isFromPagesJaunes(poi)) return `${_('In partnership with')} PagesJaunes.`;
};

const Contribution = ({ poi }) => {
  const { _ } = useI18n();

  if ((!isFromOSM(poi) && !isFromPagesJaunes(poi) && !isFromTripAdvisor(poi)) || !poi.meta) {
    return null;
  }

  const { source_url, contribute_url } = poi.meta;
  const sendTelemetryEvent = event => () => Telemetry.sendPoiEvent(poi, event);

  return (
    <Flex
      className={classnames(
        'contribute',
        isFromOSM(poi) && 'contribute--osm',
        isFromPagesJaunes(poi) && 'contribute--pj',
        isFromTripAdvisor(poi) && 'contribute--ta'
      )}
    >
      <div className="contribute__logo" />
      <div className="u-text--caption">
        <p>{sentenceFor(poi, _)}</p>
        <div>
          <a
            className="u-mr-xl"
            href={source_url}
            rel="noopener noreferrer"
            target="_blank"
            onClick={sendTelemetryEvent(eventName(poi, 'view'))}
          >
            {_('View')}
          </a>
          <a
            href={contribute_url}
            rel="noopener noreferrer"
            target="_blank"
            onClick={sendTelemetryEvent(eventName(poi, 'edit'))}
          >
            {_('Edit')}
          </a>
        </div>
      </div>
    </Flex>
  );
};

export default Contribution;
